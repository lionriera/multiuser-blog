import React from 'react';
import {
  Link,
  Redirect,
} from "react-router-dom";
import axios from 'axios';
import BreadCrumb from './tools/BreadCrumb.jsx';
import Config from '../Config';
/*tools*/
import BaseUrl from '../tools/Base';
import errorStatusCode from '../tools/errorStatusCode';
import print from '../tools/print';
/*context*/
import ContextDATA from '../ContextDATA';

class SetAccountCMP extends React.Component {
  static contextType = ContextDATA;
  constructor(props){
    super(props)
    this.handle = this.handle.bind(this)
    this.state = {
      headers: {},
      redirect: '',
      preview: '',
      users: {
        name:'',
        email:'',
        gender:'',
        born:'',
        location:'',
        avatar: {}
      },
      finishedUser: false
    }
    this.updateUser = this.updateUser.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
  }
  /*HANDLING FORM*/
  handle(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState(prevState => {
      var users = Object.assign({}, prevState.users)
      users[name] = value
      return {users}
    })
  }
  onFileChange(event) {
    this.setState(prevState => {
      var users = Object.assign({}, prevState.users)
      users['avatar'] = event.target.files[0]
      return {users}
    })
    this.setState({preview: URL.createObjectURL(event.target.files[0])})
  };
  componentDidMount(){
    document.title = 'Setting Account | Go Blog'
    var account = window.localStorage.getItem('account')
    account ? this.setState({headers: {Authorization: JSON.parse(account).token}}): this.setState({redirect: '/login'})
    account ? axios.get(`${BaseUrl}api/user/${JSON.parse(account).data.id}`).then(result => {
      this.setState({
        users: {
          name: result.data.name,
          email: result.data.email,
          gender: result.data.gender,
          born: result.data.born,
          bio: result.data.bio,
          location: result.data.location,
        },
        finishedUser: true
      })
      $('select').formSelect();
    })
    : ''
    $(document).ready(function(){
      $('.collapsible').collapsible();
      $('select').formSelect();
    });
  }
  updateUser(e){
    e.preventDefault();
    let formData;
    formData = new FormData()
    formData.append('name', this.state.users.name);
    formData.append('email', this.state.users.email);
    formData.append('gender', this.state.users.gender);
    formData.append('born', this.state.users.born);
    formData.append('bio', this.state.users.bio);
    formData.append('location', this.state.users.location);
    this.state.users.avatar ? formData.append('avatar', this.state.users.avatar): '';
    axios.post(`${BaseUrl}api/users/update/${this.context.users.id}`, formData, {headers: this.state.headers}).then(result => {
      M.toast({html: result.data.message})
      var data = JSON.parse(window.localStorage.account);
      formData
      data.data.name = this.state.users.name;
      data.data.email = this.state.users.email;
      data.data.gender = this.state.users.gender;
      data.data.born = this.state.users.born;
      data.data.bio = this.state.users.bio;
      data.data.location = this.state.users.location;
      if(this.state.users.avatar){
        data.data.avatar = this.state.users.avatar.name
      }
      this.context.setState({name: 'users', value: data.data})
      window.localStorage.setItem('account', JSON.stringify(data))
    })
  }
  render(){
    if(this.state.redirect || !window.localStorage.getItem('account')) {
      return this.state.redirect ? <Redirect to={this.state.redirect} />: <Redirect to="/login" />
    }
    return(
      <React.Fragment>
      <BreadCrumb data={[{url: '/setting/account', str: 'Setting Account'}]} />
      <div className="card-panel">
        <form className="row" onSubmit={this.updateUser}>
          <ContextDATA.Consumer>
            {
              result => (
                <React.Fragment>
                <div className="col s12 m6">
                  <h5>My Photo Profile</h5>
                  {
                    this.state.preview ? <img className="responsive-img" src={this.state.preview}/>:
                      <img
                        className="responsive-img"
                        src={
                          result.users.id || !result.users.avatar ?
                            result.users.gender == 'pria' || result.users.gender == 'male' ?
                              Config.users.avatarDefault
                            : Config.users.avatarDefaultGirl
                          : BaseUrl + 'api/usrfile/' + result.users.id + '/' + result.users.avatar
                        }
                      />
                  }
                </div>
                <div className="col s12 m6">
                  <h5>My Data</h5>
                  <div className="row">
                    <div className="input-field col s6">
                      <input disabled={this.state.finishedUser ? false: true} name="name" defaultValue={this.state.users.name} id="name" type="text" className="validate" onKeyUp={this.handle}/>
                      <label className="active" htmlFor="name">Name</label>
                    </div>
                    <div className="input-field col s6">
                      <input disabled={this.state.finishedUser ? false: true} name="email" defaultValue={this.state.users.email} id="email" type="email" className="validate" onKeyUp={this.handle}/>
                      <label className="active" htmlFor="email">Email</label>
                    </div>
                    <div className="input-field col s6">
                      <label className={this.state.finishedUser ? 'active': ''}>Gender</label>
                      <select disabled={this.state.finishedUser ? false: true} name="gender" value={this.state.users.gender} onChange={this.handle}>
                        <option value="" disabled={true}>Choose your option</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="input-field col s6">
                      <input disabled={this.state.finishedUser ? false: true} type="date" name="born" defaultValue={this.state.users.born} className="datepicker" onKeyUp={this.handle}/>
                      <label className="active">Born</label>
                    </div>
                    <div className="input-field col s12">
                      <label className={this.state.finishedUser ? 'active': ''}>Location</label>
                      <select disabled={this.state.finishedUser ? false: true} name="location" value={this.state.users.location} onChange={this.handle}>
                        <option value="" disabled={true}>Choose your location</option>
                        {
                          result.locationAPI.map((data, key) => {
                            return(<option key={key} value={data.name}>{data.name}</option>)
                          })
                        }
                      </select>
                    </div>
                    <div className="input-field col s12">
                      <textarea disabled={this.state.finishedUser ? false: true} className="materialize-textarea" name="bio" defaultValue={this.state.users.bio} onChange={this.handle}></textarea>
                      <label className="active">Bio</label>
                    </div>
                    <div className="file-field input-field col s12">
                      <div className="btn">
                        <span>Profile</span>
                        <input disabled={this.state.finishedUser ? false: true} name="avatar" onChange={this.onFileChange} type="file" accept=".jpg,.png"/>
                      </div>
                      <div className="file-path-wrapper">
                        <input disabled={this.state.finishedUser ? false: true} className="file-path validate" type="text" placeholder="Select images"/>
                      </div>
                    </div>
                    <div className="input-field col s12">
                    <button disabled={this.state.finishedUser ? false: true} type="submit" onClick={this.updateUser} className="btn waves-effect waves-dark blue">Save Changes</button>
                    </div>
                  </div>
                </div>
                </React.Fragment>
              )
            }
          </ContextDATA.Consumer>
          
        </form>
      </div>
      </React.Fragment>
    )
  }
}
export default SetAccountCMP;