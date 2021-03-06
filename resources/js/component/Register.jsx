import React from 'react';
import ReactDOM from 'react-dom'
import {
  Link,
  Redirect,
} from "react-router-dom";
import axios from 'axios';
/*tools*/
import BaseUrl from '../tools/Base';
import errorStatusCode from '../tools/errorStatusCode';

import ContextDATA from '../ContextDATA';

class RegisterCMP extends React.Component {
  static contextType = ContextDATA;
  constructor(props){
    super(props)
    this.state = {
      name: '',
      email: '',
      password: '',
      location: '',
      gender: 'male',
      avatar: '',
      redirect: '',
      process: false
    }
    this.handle = this.handle.bind(this)
    this.addAccount = this.addAccount.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
  }
  addAccount(e){
    e.preventDefault()
    this.setState({process: true})
    var formData = new FormData()
    Object.getOwnPropertyNames(this.state).forEach((name) => {
      formData.append(name, this.state[name])
    })
    formData.append('born', $('input[name="born"]').val())
    axios.post(`${BaseUrl}api/register`, formData).then(result => {
      this.setState({process: false})
      M.toast({html: 'Please Wait A Moment...'})
      this.setState({redirect: '/login'});
    }).catch(e => {
      this.setState({process: false})
      M.toast({html: e.response.data.message, classes: 'red'})
    })
  }
  onFileChange(event) { 
    this.setState({ avatar: event.target.files[0] }); 
  }
  componentDidMount(){
    document.title = 'Register | Go Blog'
    $('input.len').characterCounter();
    $('.datepicker').datepicker();
    $('select').formSelect();
    setTimeout(() => {
      $('select').formSelect();
    }, 5000)
  }
  handle(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  render(){
    if (this.state.redirect || this.context.users.id) {
      return this.state.redirect ? <Redirect to={this.state.redirect} />: <Redirect to="/" />
    }
    return(
      <React.Fragment>
      <div className="row">
        <div className="col s12 m8 offset-m2 l6 offset-l3">
          <div className="card">
            <div className="card-content">
              <h6>Register Account</h6>
              {
                this.state.process ? <div className="progress"><div className="indeterminate"></div></div>:''
              }
              <form onSubmit={this.addAccount}>
                <div className="row">
                  <div className="input-field col s12">
                    <i className="material-icons prefix">account_circle</i>
                    <input name="name" id="icon_prefix" type="text" className="validate len" onKeyUp={this.handle} data-length="10" />
                    <label htmlFor="icon_prefix">Name</label>
                    <span className="helper-text" data-error="Invalid Name" data-success="OK">* Required</span>
                  </div>
                  <div className="input-field col s12">
                    <i className="material-icons prefix">email</i>
                    <input name="email" id="icon_prefix" type="email" className="validate len" onKeyUp={this.handle} data-length="50" />
                    <label htmlFor="icon_prefix">Email</label>
                    <span className="helper-text" data-error="Invalid Email" data-success="OK">* Required</span>
                  </div>
                  <div className="input-field col s12">
                    <i className="material-icons prefix">vpn_key</i>
                    <input name="password" id="icon_telephone" type="password" className="validate len" onKeyUp={this.handle} data-length="20" />
                    <label htmlFor="icon_telephone">Password</label>
                    <span className="helper-text" data-error="Invalid Password" data-success="OK">* Required</span>
                  </div>
                  <div className="input-field col s12">
                    <i className="material-icons prefix">face</i>
                    <label className="active">Gender</label>
                    <select name="gender" defaultValue={this.state.gender} onChange={this.handle}>
                      <option value="" disabled={true}>Choose your option</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="input-field col s12">
                    <ContextDATA.Consumer>
                      {
                        result => (
                          <React.Fragment>
                            <i className="material-icons prefix">place</i>
                            <label className="active">Location</label>
                            <select name="location" defaultValue="Choose your option" onChange={this.handle}>
                              <option value="" disabled={true}>Choose your location</option>
                              {
                                result.locationAPI.map((data, key) => {
                                  return(<option key={key} value={data.name}>{data.name}</option>)
                                })
                              }
                            </select>
                          </React.Fragment>
                        )
                      }
                    </ContextDATA.Consumer>
                  </div>
                  <div className="input-field col s12">
                    <i className="material-icons prefix">event</i>
                    <input autoComplete="off" type="text" name="born" className="datepicker"/>
                    <label className="active">Born</label>
                  </div>
                  <div className="file-field input-field col s12">
                    <div className="btn blue">
                      <span>Avatar</span>
                      <input name="avatar" onChange={this.onFileChange} type="file"/>
                    </div>
                    <div className="file-path-wrapper">
                      <input className="file-path validate" accept=".jpg,.png" type="text"/>
                    </div>
                  </div>
                  <div className="col s12">
                    <button type="submit" className="btn waves-effect waves-light w-100 blue">Register</button>
                    <div className="divider"/>
                    <p style={{marginTop:25}}>Have a account ? <Link to="/login">Login Now</Link></p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </React.Fragment>
    )
  }
}

export default RegisterCMP;