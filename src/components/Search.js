import React, { Component } from 'react';
import axios from 'axios';

class Search extends Component {
    state = { 
        "search": "",
        "result": {"studentname": "", "fathername": ""}
    } 

    handleChange = async ({currentTarget: input}) => {
       
        const search = input.value
        const result = await axios.get(`/api/student/${search}`)
        if(result.data !== "")  this.props.onStudentSearch(result.data) 
        else this.props.onStudentSearch({"regno": ""})
        this.setState({search, result:result.data})
        
    }

    render() { 
        return (
         <React.Fragment>   
        <input 
        type = "text"
        name = "search"
        value = {this.state.value}
        onChange = {this.handleChange}
        /> 
        <h4>student name: {this.state.result.studentname} </h4>
        <h4>father name: {this.state.result.fathername}</h4>      
        </React.Fragment>
        );
    }
}
 
export default Search;