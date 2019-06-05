const express = require("express");
const router = express.Router();

module.exports = router;
// /user/disactive
// /user/id/:id
// /user/
// /user/login
// /user/token

let tokenList = {};

router.get("/disactive", async (req, res) => {
  let db = req.db;
  let data = await db("user as u")
    .leftJoin("eec_center as e", "u.org_id", " e.eec_center_id")
    .leftJoin("school as s", "u.org_id", " s.school_id")
    .leftJoin("business as b", "u.org_id", " b.business_id")
    .where({ status: "disactive" })
    .select([
      "u.user_id",
      "u.username",
      "u.fname",
      "u.lname",
      "u.status",
      db.raw(
        "if(u.user_type_id=1,e.office_name,if(u.user_type_id=2,e.office_name,if(u.user_type_id=3,s.school_name,b.business_name))) as org_name"
      )
    ]);
  res.send({ data });
});

router.get("/:id", async (req, res) => {
  let db = req.db;
  let data = await db("user as u")
    .leftJoin("eec_center as e", "u.org_id", " e.eec_center_id")
    .leftJoin("school as s", "u.org_id", " s.school_id")
    .leftJoin("business as b", "u.org_id", " b.business_id")
    .where({ user_id: req.params.id })
    .select([
      "u.user_id",
      "u.username",
      "u.fname",
      "u.lname",
      "u.status",
      db.raw(
        "if(u.user_type_id=1,e.office_name,if(u.user_type_id=2,e.office_name,if(u.user_type_id=3,s.school_name,b.business_name))) as org_name"
      )
    ]);
  res.send({ data });
});

router.get("/", async (req, res) => {
  let db = req.db;
  let data = await db("user as u")
    .leftJoin("eec_center as e", "u.org_id", " e.eec_center_id")
    .leftJoin("school as s", "u.org_id", " s.school_id")
    .leftJoin("business as b", "u.org_id", " b.business_id")
    .select([
      "u.user_id",
      "u.username",
      "u.fname",
      "u.lname",
      "u.status",
      db.raw(
        "if(u.user_type_id=1,e.office_name,if(u.user_type_id=2,e.office_name,if(u.user_type_id=3,s.school_name,b.business_name))) as org_name"
      )
    ]);
  res.send({ data });
});

router.post("/login", async (req, res) => {
  // check require
  if (!req.query.username || !req.query.password) {
    return res.send({
      message: "กรุณาตรวจสอบชื่อผู้ใช้งานและรหัสผ่าน",
      status: "fail"
    });
  }
  let tokenDate = tokenList[req.query.token];
  if (!tokenDate) {
    return res.send({});
  }
  if (new Date().getTime() - tokenDate.getTime() > 5 * 60 * 1000) {
    // expired token
    delete tokenList[req.query.token];
  }
  let db = req.db;
  let row = await db("user")
    .where({ username: req.query.username, status: "active" })
    .then(rows => rows.length && rows[0]);

  let strHash = create_password_hash(req.query.password, PASSWORD_DEFAULT);

  if (!row || !verify_password_hash($row.password, strHash)) {
    return res.send({
      message: "กรุณาตรวจสอบชื่อผู้ใช้งานและรหัสผ่าน2",
      status: "fail"
    });
  }

  // TODO: $_SESSION['user'] = $result;
  res.send({
    message: "เข้าสู่ระบบสำเร็จ",
    status: "success"
  });
});
router.get("/token", (req, res) => {
  let token = md5("ECC" + Math.random());
  tokenList[token] = new Date();
  res.send({ token });
});

////

router.post("/login2", async (req, res) => {
  // 1. check require
  if (!req.body.user || !req.body.pass) {
    return res.send({
      message: "กรุณาตรวจสอบชื่อผู้ใช้งานและรหัสผ่าน",
      status: "fail"
    });
  }
  let db = req.db;
  //2. check user
  console.log("chaeck user", req.body.user);
  let rows = await db("person").where({
    username: req.body.user
    //status: 'active',
  });
  //users = JSON.parse(JSON.stringify(rows));
  console.log("rows.length", rows.length);
  if (rows.length == 0) {
    return res.send({
      message: "กรุณาตรวจสอบชื่อผู้ใช้งานและรหัสผ่าน",
      status: "fail",
      rows: "ไม่ถูกต้อง"
    });
  }
  // TODO: 3. check pass

  // TODO: 4. $_SESSION['user'] = $result;
  //res.session.data = user;
  console.log("login ok");
  //users = JSON.parse(JSON.stringify(rows));
  console.log("user::", rows);
  let user = rows[0];
  res.send({
    ok: true,
    message: "เข้าสู่ระบบสำเร็จ",
    status: "success",
    user
  });
});
//  ลงเวลาปฏิบิตงาน
router.post("/signin", async (req, res) => {
  // 1. check require
  if (!req.body.user) {
    return res.send({
      message: "กรุณากรอก USERNAME ลงเวลา",
      status: "fail"
    });
  }
  let db = req.db;
  //2. check user
  //console.log("chaeck user", req.body.user);
  let rows = await db("person").where({
    username: req.body.user
    //status: 'active',
  });
  //users = JSON.parse(JSON.stringify(rows));
  //console.log("rows.length", rows.length);
  if (rows.length == 0) {
    return res.send({
      message: "กรุณากรอก USERNAME ลงเวลาด้วยคะ.!",
      status: "fail"
    });
  }
  // TODO: 3. INSERT USERNAME INTO TABLE

  // let rows = await db("person").where({
  //   username: req.body.user
  //   //status: 'active',
  // });
 console.log('insert=>',req.body)
  let id = await db("work_time").insert({
    person_id: req.body.user,
    start_time: req.body.start_time,
    date_in: req.body.date_in,
    status: req.body.status,
    // status: rows[0].status
  });
  // .then(ids => ids[0]);
  if (id) {
    console.log("id=>", id);
    console.log("login ok");
    //users = JSON.parse(JSON.stringify(rows));
    //console.log("user::", rows);
    let user = rows[0];
    res.send({
      ok: true,
      message: "insert complete",
      status: "success",
      user
    });
  } else {
    res.send({
      ok: false,
      message: "insert error",
      status: "error"
    });
  }
});

//////Sign  OUT


router.post("/signout", async (req, res) => {
  // 1. check require
  if (!req.body.user) {
    return res.send({
      message: "กรุณากรอก USERNAME เพื่อลงเวลาออก",
      status: "fail"
    });
  }
  let db = req.db;
  //2. check user
  //console.log("chaeck user", req.body.user);
  let rows = await db("work_time").where({
    person_id: req.body.user
    //status: 'active',
  });
  //users = JSON.parse(JSON.stringify(rows));
  //console.log("rows.length", rows.length);
  if (rows.length == 0) {
    return res.send({
      message: " คุณไม่ได้ลงเวลามาทำงานคะ กรุณาติดต่องานบุคลากร..!",
      status: "fail"
    });
  }
  // TODO: 3. INSERT USERNAME INTO TABLE

  // let rows = await db("person").where({
  //   username: req.body.user
  //   //status: 'active',
  // });
  //// UPDATE student SET name='Name01', age=age + 1 WHERE code='01'

 console.log('update=>',req.body)
 let date_out = JSON.stringify(req.body.date_out)
 let person_id = req.body.user
  let id = await db.raw(`UPDATE work_time SET date_out=${date_out} WHERE person_id=${person_id}`);
  // .then(ids => ids[0]);
  if (id) {
    console.log("id=>", id);
    console.log("Update ok");
    //users = JSON.parse(JSON.stringify(rows));
    //console.log("user::", rows);
    let user = rows[0];
    res.send({
      ok: true,
      message: "UPDATE complete",
      status: "success",
      user
    });
  } else {
    res.send({
      ok: false,
      message: "UPDATE error",
      status: "error"
    });
  }
});



//// รายงาน
router.post("/listuser_day", async (req, res) => {
  let db = req.db;

  let rows = await db.raw(
    "SELECT * FROM work_time AS wt,teacher AS t WHERE t.teacher_code = wt.person_id ORDER BY wt.date_in  "
  );
  console.log("ok=search");
  // users = JSON.parse(JSON.stringify(rows));
  console.log("rows.length", rows.length);
  if (rows.length == 0) {
    return res.send({
      message: "ไม่มีข้อมูลในระบบคะ.!",
      status: "fail"
    });
  }
  // let user = rows;
  res.send({
    ok: true,
    message: "select complete",
    status: "success",
    user: rows[0]
  });
});

//rows = [[{ id, person_id }, {}, {}], [{ name: "id", type: "number" }]];
