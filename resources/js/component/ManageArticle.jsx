import React, {Suspense} from 'react'
import {
  Link,
  Redirect,
} from "react-router-dom";
import axios from 'axios';
import BreadCrumb from './tools/BreadCrumb.jsx'
import Datatables from './tools/Datatables.jsx';
import { Editor } from '@tinymce/tinymce-react';
/*tools*/
import BaseUrl from '../tools/Base';
import errorStatusCode from '../tools/errorStatusCode';
import print from '../tools/print';
/*context*/
import ContextDATA from '../ContextDATA';

const Datatable = React.lazy(() => import('./tools/Datatables.jsx'));

class ManageArticleCMP extends React.Component {
  handleEditorChange = (content, editor) => {
    this.setState({create_content: content})
  }
  constructor(props) {
    super(props)
    this.state = {
      selected: [],
      category: [],
      create_title: '',
      create_category_id: '',
      create_description: '',
      create_content: '',
      create_status: '',
      create_image: '',
      redirect: '',
      headers: {},
      tinymce: {
        data: {
          height: 500,
          menubar: false,
          plugins: [
            'advlist autolink link image lists charmap print preview hr anchor pagebreak',
            'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
            'table emoticons template paste help'
          ],
          toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image | print preview media fullpage | ' +
            'forecolor backcolor emoticons | help',
          menu: {
            favs: {title: 'My Favorites', items: 'code visualaid | searchreplace | emoticons'}
          },
          contextmenu: 'undo redo paste copy'
        }
      }
    }
    this.adding = this.adding.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
    this.handle = this.handle.bind(this)
  }
  adding(event) {
    const formData = new FormData();
    formData.append('title', this.state.create_title)
    formData.append('category_id', this.state.create_category_id)
    formData.append('description', this.state.create_description)
    formData.append('content', this.state.create_content)
    formData.append('status', this.state.create_status)
    formData.append('image', this.state.create_image)
    axios.post(BaseUrl + 'api/article', formData, {headers: this.state.headers}).then(result => {
      Swal.fire('Successfuly', result.data.message, 'success')
    }).catch(e => {
      M.toast({html: e.response.data.message, classes: 'red'})
    })
  }
  onFileChange(event) {
    this.setState({ create_image: event.target.files[0] }); 
  };
  handle(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }
  componentDidMount() {
    document.title = 'Manage Article | Go Blog'
    var account = window.localStorage.getItem('account')
    if(account){
      this.setState({
        headers: {Authorization: JSON.parse(account).token}
      })
      $(document).ready(() => {
        $('.tabs').tabs();$('select').formSelect();
      })
    }else{
      this.setState({redirect: '/login'})
    }
  }
  render() {
    if(this.state.redirect || !window.localStorage.getItem('account')) {
      return this.state.redirect ? <Redirect to={this.state.redirect} />: <Redirect to="/login" />
    }
    return(
      <React.Fragment>
      <BreadCrumb data={[{url: '/management/article', str: 'Management Article'}]} />
      <div className="row">
        <div className="col s12">
          <div className="card-panel">
            <ul id="tabs-swipe-demo" className="tabs">
              <li className="tab col s6"><a className="active" href="#tabs-data">Data</a></li>
              <li className="tab col s6"><a href="#tabs-create">Create</a></li>
            </ul>
            <div className="row">
              <div id="tabs-data" className="col s12">
                <Suspense fallback={<div>Loading...</div>}>
                  <Datatable 
                    editable={true}
                    hasArticle={true}
                    paginate={true}
                    heading={
                      ['#', 'Title', 'Created']
                    }
                    td={
                      ['id', 'title', 'created_at']
                    }
                    url={{
                      default: BaseUrl + 'api/article',
                      deleted: BaseUrl + 'api/article/',
                      edited: BaseUrl + 'api/article/',
                      search: BaseUrl + 'api/search/article'
                    }}
                    form={
                      ['id', 'category_id', 'title', 'description', 'content', 'status', 'updated_at']
                    }
                    type={[false,'number-disabled','text', 'textarea', 'textareatinymce', 'select|public,private', false]}
                  />
                </Suspense>
              </div>
              <div id="tabs-create" className="col s12">
                <div className="row mt-10px">
                  <div className="input-field col s12">
                    <input type="text" name="create_title" onChange={this.handle} className="validate"/>
                    <label>Title</label>
                  </div>
                  <div className="col s12 m6">
                  <ContextDATA.Consumer>
                  {
                    result => (
                      <select name="create_category_id" onChange={this.handle} defaultValue="Choose category" className="browser-default">
                        <option value="Choose your option" disabled>Category article</option>
                        {
                          result.category.map((text, key) => {
                            return(
                              <option key={key} value={text.id}>{text.name}</option>
                            )
                          })
                        }
                      </select>
                    )
                  }
                  </ContextDATA.Consumer>
                  </div>
                  <div className="col s12 m6">
                    <select name="create_status" onChange={this.handle} defaultValue="Choose your option" className="browser-default">
                      <option value="Choose your option" disabled>Choose status article</option>
                      <option value="public">Public</option>
                      <option value="archive">Archives</option>
                    </select>
                  </div>
                  <div className="input-field col s12">
                    <label>Description</label>
                    <textarea name="create_description" className="materialize-textarea" onChange={this.handle}/>
                  </div>
                  <div className="file-field input-field col s12">
                    <div className="btn">
                      <span>File</span>
                      <input onChange={this.onFileChange} type="file" accept=".jpg,.png"/>
                    </div>
                    <div className="file-path-wrapper">
                      <input className="file-path validate" type="text" placeholder="Upload Image Files"/>
                    </div>
                  </div>
                  <div className="col s12">
                    <Editor
                      initialValue="<p>This is the initial content of the editor</p>"
                      init={this.state.tinymce.data}
                      onEditorChange={this.handleEditorChange}
                    />
                  </div>
                  <div className="col s12">
                    <button className="btn waves-effect waves-light blue mt-10px" onClick={this.adding}>Submit<i className="material-icons right">send</i></button>
                  </div>
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
export default ManageArticleCMP;