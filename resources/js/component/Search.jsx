import React from 'react';
import {
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import ColsArticleCMP from './tools/ColsArticleCMP.jsx';
import BaseUrl from '../tools/Base';
import BreadCrumb from './tools/BreadCrumb.jsx';
import Loader from './tools/Loader.jsx';
import functionAction from './tools/FunctionAction';

import axios from 'axios';
import Config from '../Config';
/*tools*/
import errorStatusCode from '../tools/errorStatusCode';
import print from '../tools/print';
/*context*/
import ContextDATA from '../ContextDATA';

class SearchCMP extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      article: {
        data:[],
        total:''
      },
      users: {
        data:[],
        total:''
      },
      img_girl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80',
      paginate: 1,
      search: '',
      finishedArticle: false,
      finishedUser: false,
    }
    this.handle = this.handle.bind(this)
    this.addSubscribe = this.addSubscribe.bind(this)
    this.nextArticle = this.nextArticle.bind(this)
  }
  componentDidMount(){
    document.title = 'Search: ' + this.props.match.params.search + ' | Go Blog'
    this.fetch()
  }
  componentDidUpdate(prefProps){
    if(prefProps.match.params.search !== this.props.match.params.search){
      this.componentDidMount()
    }
  }
  fetch(){
      axios.get(`${BaseUrl}api/article?page=${1}&search=${this.props.match.params.search}`).then(result => {
        this.setState({
          article: result.data,
          search: this.props.match.params.search,
          finishedArticle: true
        })
      })
      axios.get(`${BaseUrl}api/user?page=${1}&search=${this.props.match.params.search}`).then(result => {
        this.setState({
          users: result.data,
          finishedUser: true
        })
      })

  }
  async addSubscribe(e){
    let subscribe = await functionAction.subscribeUser('Subscribe', e.target.dataset.user_id)
  }
  handle(){
    const target = event.target;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [name]: value
    });
  }
  nextArticle(e){
    if(e.target.id == 'next-article'){
      document.querySelector('#next-article').setAttribute('disabled', true)
      this.setState({
        finishedArticle: false
      })
      axios.get(`${BaseUrl}api/article?page=${this.state.paginate + 1}&search=${this.props.match.params.search}`).then(result => {
        if(result.data.data.length >= 1){
          this.setState({paginate: this.state.paginate + 1})
          this.setState({
            'article': {
              data: [...this.state.article.data, ...result.data.data],
              total: result.data.total
            },
            finishedArticle: true
          })
          document.querySelector('#next-article').removeAttribute('disabled')
        }if(result.data.data.length == 0){
          this.setState({
            finishedArticle: true
          })
          document.querySelector('#next-article').removeAttribute('disabled')
        }
      })
    }
    if(e.target.id == 'next-users'){
      document.querySelector('#next-users').setAttribute('disabled', true)
      this.setState({
        finishedUser: false
      })
      axios.get(`${BaseUrl}api/user?page=${this.state.paginate + 1}&search=${this.props.match.params.search}`).then(result => {
        if(result.data.data.length >= 1){
          this.setState({paginate: this.state.paginate + 1})
          this.setState({
            'users': {
              data: [...this.state.users.data, ...result.data.data],
              total: result.data.total
            },
            finishedUser: true
          })
          document.querySelector('#next-users').removeAttribute('disabled')
        }if(result.data.data.length == 0){
          this.setState({
            finishedUser: true
          })
          document.querySelector('#next-users').removeAttribute('disabled')
        }
      })
    }
  }
  render(){
    return(
      <React.Fragment>
        <BreadCrumb data={[{url: '/search', str: 'Search'}]} />
        <h5 className="ml-10px">Article</h5>
        <div className="row">
        {
          this.state.article.data.map((text, key) => {
            return(
              <ColsArticleCMP key={key} data={{
                id: text.id,
                user_id: text.user_id,
                title: text.title,
                description: text.description,
                author: text.name,
                views: text.views,
                gender: text.gender,
                location: text.location,
                image: `${BaseUrl}api/usrfile/${text.user_id}/${text.image}`,
                avatar: text.avatar.length == 0 ? Config.users.avatarDefault:`${BaseUrl}api/usrfile/${text.user_id}/${text.avatar}`,
                created_at: text.created_at,
              }}/>
            )
          })
        }
        </div>
        {
          this.state.finishedArticle ?
            this.state.article.data.length !== 0 ?
            <React.Fragment>
            <p className="ml-10px">Total Result: {this.state.article.total}</p>
            <div className="center-align mb-10px">
              <a id="next-article" className="waves-effect waves-light blue btn ml-5px" onClick={this.nextArticle}><i className="material-icons right">expand_more</i>Load More</a>
            </div>
            </React.Fragment>
            :<p className="center-align m-100px">Article Does Not Exist</p>
          :<Loader/>
        }
        <h5 className="ml-10px">User</h5>
        <ContextDATA.Consumer>
        {
          result => (
            <div className="row">
              {
                this.state.users.data.map((data, key) => {
                  return(
                  <div className="col s12 m4 l3 list-profile" key={key}>
                    <div className="card hoverable">
                      <div className="card-image">
                        <img src={data.avatar.length == 0 ? data.gender == 'pria' || data.gender == 'male' ? Config.users.avatarDefault: this.state.img_girl: BaseUrl + 'api/usrfile/' + data.id + '/' + data.avatar}/>
                        <span className="card-title">{data.name}</span>
                      </div>
                      <div className="card-content">
                        <button
                          disabled={result.users.id ? result.users.id !== data.id? false: true: true}
                          data-user_id={data.id}
                          onClick={this.addSubscribe}
                          className="btn btn-floating red waves-effect waves-light subscribe">
                            <i
                              data-user_id={data.id}
                              className="material-icons">subscriptions
                            </i>
                        </button>
                        <p>{data.bio}</p>
                      </div>
                      <div className="card-action">
                        <Link to={"/profile/" + data.id} className="blue-text waves-effect waves-dark">View Profile</Link>
                      </div>
                    </div>
                  </div>
                  )
                })
              }
            </div>
          )
        }
        </ContextDATA.Consumer>
              {
                this.state.finishedUser ?
                  this.state.users.data.length !== 0 ?
                  <React.Fragment>
                  <p style={{marginLeft: 10}}>Total Result: {this.state.users.total}</p>
                  <div className="center-align mb-10px">
                    <a id="next-users" className="waves-effect waves-light blue btn" style={{marginLeft:5}} onClick={this.nextArticle}><i className="material-icons right">expand_more</i>Load More</a>
                  </div>
                  </React.Fragment>
                  :<p className="center-align m-100px">Users Does Not Exist</p>
                :<Loader/>
              }
      </React.Fragment>
    )
  }
}
export default SearchCMP;