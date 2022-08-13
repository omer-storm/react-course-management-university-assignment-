import React, { Component, Fragment } from 'react'
import Search from './Search'
import axios from 'axios'


export class DataSheet extends Component {

    state = {
        gpa: 0.00,
        courses: [],
        student: {},
        grades: []
    }


    handleStudentSearch = async (student) => {
        if(student.regno !== ""){
         const courses = await axios.get(`/api/registered/${student.regno}`)
         const grades = await axios.get(`/api/grades`)
         const gpa = await axios.get(`/api/cgpa/${student.regno}`)

         this.setState({student, courses: courses.data, grades: grades.data, gpa: gpa.data.gpa})
         
        }
    }
    

    handleAdd = (courseid,index) =>{
      
        let courses = this.state.courses
        
        courses[index].reg = {
            courseid: courseid,
            regno: this.state.student.regno,
            gradeid: 0
        }

        courses[index].grade= {
            gradeid: 0,
	        grade: "", 
            gpa: ""    
        }
      

        this.setState({courses})

    }


    handleRemove = async (courseid,index) =>{
        let courses = this.state.courses
        const course = await axios.get(`/api/courses/${courseid}`)
        if(courses[index].reg.gradeid !== 0){
          courses[index] = course.data
          await axios.delete(`/api/registered/${this.state.student.regno}/${courseid}`)
          const gpa = await axios.get(`/api/cgpa/${this.state.student.regno}`)
          this.setState({courses, gpa: gpa.data.gpa})
        }
        else{
        courses[index] = course.data
        this.setState({courses})
       }

    }

    handleChange = async ({currentTarget: input },prevGrade,courseid,courseIndex) => {

       if(input.value !== 0){
          let courses = this.state.courses
          let gradeIndex = input.value-1 
          if(prevGrade === 0){
            const result = await axios.post(`/api/registered/${this.state.student.regno}/${courseid}/${input.value}`)
              courses[courseIndex].reg = {
                _id: result.data._id,
                courseid: courseid,
                regno: this.state.student.regno,
                gradeid: this.state.grades[gradeIndex].gradeid
              }
            
          }
           else
           {
            await axios.patch(`/api/registered/${courses[courseIndex].reg._id}/${input.value}`)
            courses[courseIndex].reg = {
                _id: courses[courseIndex].reg._id,
                courseid: courseid,
                regno: this.state.student.regno,
                gradeid: this.state.grades[gradeIndex].gradeid
              }
           }
            
        
           
           
               courses[courseIndex].grade= {
               gradeid: this.state.grades[gradeIndex].gradeid,
               grade:this.state.grades[gradeIndex].grade, 
               gpa:this.state.grades[gradeIndex].gpa  
             }
             const gpa = await axios.get(`/api/cgpa/${this.state.student.regno}`)

             this.setState({courses, gpa: gpa.data.gpa})  


       }
        
    }


    render() {
        
        return (
            <Fragment>
                <Search onStudentSearch = {this.handleStudentSearch} />
                
                
                <div style={{ display: 'flex' }} className="container-1">
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sem</th>
                                    <th>Title</th>
                                </tr>
                            </thead>
                            <tbody>
                               {this.state.courses.map( (course,index) => 
                                  
                                <tr
                                 onClick={() => (course.reg === undefined) ? this.handleAdd(course.courseid,index):this.handleRemove(course.courseid,index) }
                                style={(course.reg === undefined) ? {cursor: "pointer", color:"black"} : {cursor: "pointer", color:"blue"}}
                                key={index}>
                                    <td>{course.semester}</td>
                                    <td >{course.title}</td>
                                </tr>
                                )}
                            </tbody>
                        </table>

                    </div>
                    <div></div>
                    <div>

                        <table>
                            <thead>
                                <tr >
                                    <th>Code</th>
                                    <th>Title</th>
                                    <th>CrHr</th>
                                    <th>Grade</th>
                                    <th>GPA</th>
                                </tr>
                            </thead>
                            <tbody>
                            {this.state.courses.map( (course,index) => 
                                <tr key={index} style={(course.reg === undefined) ? {cursor: "pointer", color:"grey"} : {cursor: "pointer", color:"black"}}>
                                    <td>{course.code}</td>
                                    <td>{course.title}</td>
                                    <td>{course.crhr}</td>
                                     <td>
                                      {(course.reg !== undefined) &&
                                       <select 
                                        value={course.grade.gradeid} 
                                        onChange={(e) =>this.handleChange(e,course.reg.gradeid,course.courseid,index)}
                                        >
                                       <option value={0}></option>     
                                       {this.state.grades.map( (grade,index) =>     
                                       <option key={index} value={grade.gradeid}>{grade.grade}</option>
                                       )}
                                     </select>}
                                    </td> 
                                    <td>{(course.grade === undefined) ? "" : course.grade.gpa}</td>
                                    </tr>
                                    )}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <strong>
                            GPA: { (this.state.gpa !== undefined ) && this.state.gpa.toFixed(2)}

                        </strong>
                        
                    </div>
                    {/* <pre style={{ textAlign: 'left' }}>{
                        JSON.stringify(this.state, null, 2)
                    }</pre> */}
                </div>

            </Fragment>
        )
    }
}

export default DataSheet