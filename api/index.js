const router = require('express').Router()
const db = require('../models')

router.get('/student/:id',async(req,res)=>{
    const students = await db.Student.find({ regno: req.params.id })
    res.status(200).json(students[0])
})

router.get('/courses/:id', async (req, res)=>{
    const courses = await db.Course.find({'courseid': req.params.id})
    res.status(200).json(courses[0])
})

router.post('/registered/:regno/:courseid/:gradeid', async (req,res) => {
//  console.log(req.params)
 const reg = await db.Registration.create({'regno': req.params.regno, 'courseid': req.params.courseid, 'gradeid': req.params.gradeid})
 res.status(200).json(reg)
})

router.get('/registered/:regno', async (req, res)=>{
    const courses = await db.Course.aggregate([
        { $lookup: { from: 'registrations',localField: 'courseid', foreignField: 'courseid',as: 'reg',pipeline:[{"$match":{"regno":req.params.regno}}]}},
        { $unwind: { path: "$reg", preserveNullAndEmptyArrays: true }}, 
        { $lookup: { from: 'grades',localField: 'reg.gradeid', foreignField: 'gradeid',as: 'grade',}},
        { $unwind: { path: "$grade", preserveNullAndEmptyArrays: true } } 
    ]).sort({ semester: 1, courseid: 1 })
    res.status(200).json(courses)
})

router.delete('/registered/:regno/:courseid',async(req,res) =>{
      const reg = await db.Registration.deleteOne({regno: req.params.regno, courseid: req.params.courseid})
      res.status(200).json(reg)
})

router.patch('/registered/:id/:gradeid/',async(req,res) => {
     const reg =  await db.Registration.updateOne({"_id":req.params.id},
    {
        $set: {
            gradeid: req.params.gradeid
        }
    }
    
    
    )

    res.status(200).json(reg);
 
 })

router.get('/grades',async(req,res)=> {
      const grades = await db.Grade.find()
      res.status(200).json(grades);

})

router.get('/cgpa/:regno', async(req,res) => {
    const gpa = await db.Registration.aggregate([ 
        { $match : { regno : req.params.regno, gradeid: { $ne: null } } },
        { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}},
        { $unwind : "$course" },  
        { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
        { $unwind: "$grade" },
        { $group: {_id: null, tcr: { $sum: "$course.crhr"}, tgpa: { $sum: { $multiply: ["$course.crhr", "$grade.gpa"]}}}},
        { $project: {_id: 0, gpa: {$divide: ["$tgpa", "$tcr"]}}}
        
        ]); 

        res.status(200).json(gpa[0]); 

})


// router.get('/registeredcourses/:regno',async(req,res)=>{
//     const registered_courses = await db.Registration.aggregate([ 
//         { $match : { regno : req.params.regno, gradeid: { $ne: null } } },
//         { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
//         { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
//         ]);     
           
//     res.status(200).json(registered_courses);
// });   

// router.delete('/registeredcourses/:regno',async(req,res) =>{
//       const registered_courses = await db.Registration.deleteOne({})
  
//  })

// router.get('/register/:regno/:courseid/:gradeid',async(req,res) => {
//     const reg =  await db.Registration.create({courseid: req.params.courseid, regno: req.params.regno, gradeid: req.params.gradeid})
//     res.status(200).json(reg);
 
//  })




// router.get('/remove/:courseid/',async(req,res) => {
//     const reg =  await db.Registration.deleteOne({courseid: req.params.courseid})
//     const course = await db.Course.find({ courseid: req.params.courseid })
//     res.status(200).json({reg,course: course[0]});
 
//  })

//  router.get('/update/:id/:gradeid/',async(req,res) => {
//     const reg =  await db.Registration.updateOne({"_id":req.params.id},
//     {
//         $set: {
//             gradeid: req.params.gradeid
//         }
//     }
    
    
//     )
//     // console.log(req.params.gradeid)
    
//     res.status(200).json(reg);
 
//  })


exports.addRegistration = (req, res) => {
    //console.log(req.body);

    let courseids = JSON.parse(req.body.courseids)

    let regs = [];

    for(courseid of courseids){
        regs.push(new Registration({courseid: courseid, regno: req.body.regno, gradeid: null}));
    }
    //console.log(regs);

    db.Registration.insertMany(regs)
    .then(regs => {
        res.status(200).json(regs);    
    });    
}

exports.updateRegistration = async (req, res) => {
    console.log('Params :>> ', req.body);

    let result = await db.Registration.updateOne({ _id: req.body.id }, {
        $set: {
            gradeid: req.body.gradeid
        }
    })

    res.status(200).json(result);

}

exports.getUpdatedGPA = async (req, res) => {
    db.Registration.aggregate([
        { $match : { regno : req.params.regno, gradeid: { $ne: null } } },
        { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
        { $unwind : "$course" }, 
        { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
        { $unwind: "$grade" },
        { $group: {_id: null, tcr: { $sum: "$course.crhr"}, tgpa: { $sum: { $multiply: ["$course.crhr", "$grade.gpa"]}}}},
        { $project: {_id: 0, gpa: {$divide: ["$tgpa", "$tcr"]}}}
    ])
    .then(gpa => {
        res.status(200).json(gpa[0]);    
    });      
}


exports.getRegistrationsByRegNo = (req, res) => {
    Promise.all([
        db.Registration.aggregate([
            { $match : { regno : req.params.regno } },
            { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
            { $unwind : "$course" }, 
            { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
            { $unwind: { path: "$grade", preserveNullAndEmptyArrays: true } }
        ]), 
        db.Grade.find().sort({ gradeid: 1}),
        db.Registration.aggregate([
            { $match : { regno : req.params.regno, gradeid: { $ne: null } } },
            { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
            { $unwind : "$course" }, 
            { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
            { $unwind: "$grade" },
            { $group: {_id: null, tcr: { $sum: "$course.crhr"}, tgpa: { $sum: { $multiply: ["$course.crhr", "$grade.gpa"]}}}},
            { $project: {_id: 0, gpa: {$divide: ["$tgpa", "$tcr"]}}}
        ])        
    ])
    .then(([regs, grades, gpa]) => {
        res.status(200).json([regs, grades, gpa[0]]);    
    });      
}


module.exports = router