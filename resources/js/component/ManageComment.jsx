import React from 'react';
import {
  Link,
  Redirect,
} from "react-router-dom";
import axios from 'axios';
import BreadCrumb from './tools/BreadCrumb.jsx'
import Datatables from './tools/Datatables.jsx';
/*tools*/
import BaseUrl from '../tools/Base';
import errorStatusCode from '../tools/errorStatusCode';
import print from '../tools/print';
/*context*/
import ContextDATA from '../ContextDATA';

class ManageCommentCMP extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      redirect: '',
    }
  }
  componentDidMount() {
    document.title = 'Manage Comment | Go Blog'
    var account = window.localStorage.getItem('account')
  }
  render() {
    if(this.state.redirect || !window.localStorage.getItem('account')) {
      return this.state.redirect ? <Redirect to={this.state.redirect} />: <Redirect to="/login" />
    }
    return(
      <React.Fragment>
      <BreadCrumb data={[{url: '/management/comment', str: 'Management Comment'}]} />
      <div className="row">
        <div className="col s12">
          <div className="card-panel">
            <div className="card-content">
              <div className="row">
                <div className="col s12">
                <ContextDATA.Consumer>
                  {
                    result => (
                      <Datatables 
                        editable={result.users.role == 'admin' ? true: false}
                        paginate={true}
                        heading={
                          ['#', 'User', 'Article', 'Comment']
                        }
                        td={
                          ['id', 'user_id', 'article_id', 'comment']
                        }
                        url={{
                          default: BaseUrl + 'api/comment',
                          deleted: BaseUrl + 'api/comment/',
                          edited: BaseUrl + 'api/comment/',
                          search: BaseUrl + 'api/search/comment'
                        }}
                        form={
                          ['id', 'user_id', 'article_id', 'comment', 'updated_at']
                        }
                        type={[false,'number-disabled', 'number-disabled', 'textarea', false]}
                        edited={this.e_edited}
                      />
                    )
                  }
                </ContextDATA.Consumer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </React.Fragment>
    )
  }
}
export default ManageCommentCMP;