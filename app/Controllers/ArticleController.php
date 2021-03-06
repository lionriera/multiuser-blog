<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Controllers\AuthController;

class ArticleController extends ResourceController
{
    protected $modelName = 'App\Models\ArticleModel';
    protected $format    = 'json';

    public function __construct()
    {
        $this->protect = new AuthController();
    }
    public function index()
    {
        if($this->request->getGet('users'))
        {
            $data = $this->model->onWhere(['app_article.status' => 'public', 'app_article.user_id' => $this->request->getGet('users')], ['app_article.created_at', 'DESC'], 9);
            return $this->respond($data);
        }
        if($this->request->getGet('paginate'))
        {
            $check = $this->protect->check($this->request->getServer('HTTP_AUTHORIZATION'));
            if(!empty($check->{'message'}) && $check->message == 'Access Granted')
            {
                if($this->request->getGet('order_by') && $this->request->getGet('order_status') && !$this->request->getGet('q'))
                {
                    $order_status = 'ASC';
                    $this->request->getGet('order_status') == 'true' ? $order_status = 'DESC': false;
                    $data = $this->model->onWhere(['app_article.status' => 'public', 'app_article.user_id' => $check->data->id], [$this->request->getGet('order_by'), $order_status], 16, $this->request->getGet('q'));
                    return $this->respond($data);
                }
                if($this->request->getGet('order_by') && $this->request->getGet('order_status') && $this->request->getGet('q'))
                {
                    $order_status = 'ASC';
                    $this->request->getGet('order_status') == 'true' ? $order_status = 'DESC': false;
                    $data = $this->model->onWhere(['app_article.status' => 'public', 'app_article.user_id' => $check->data->id], [$this->request->getGet('order_by'), $order_status], 16, $this->request->getGet('q'));
                    return $this->respond($data);
                }
            }
        }
        if($this->request->getGet('popular'))
        {
            if($this->request->getGet('user_id'))
            {
                $data = $this->model->onWhere(['app_article.status' => 'public', 'app_article.user_id' => $this->request->getGet('user_id')], ['app_article.views', 'DESC'], 9);
                return $this->respond($data);
            } else {
                $data = $this->model->onWhere(['app_article.status' => 'public'], ['app_article.views', 'DESC'], 9);
                return $this->respond($data);
            }
        }
        if($this->request->getGet('latest'))
        {
            $data = $this->model->onWhere(['app_article.status' => 'public'], ['app_article.created_at', 'DESC'], 9);
            return $this->respond($data);
        }
        if($this->request->getGet('category'))
        {
            $data = $this->model->onWhere(['app_article.status' => 'public', 'app_category.name' => $this->request->getGet('category')], ['app_article.created_at', 'DESC'], 9);
            return $this->respond($data);
        }
        if($this->request->getGet('search'))
        {
            $data = $this->model->onSearch(['app_article.status' => 'public'], ['app_article.created_at', 'DESC'], $this->request->getGet('search'), 9);
            return $this->respond($data);
        }
        if($this->request->getGet('total'))
        {
            $check = $this->protect->check($this->request->getServer('HTTP_AUTHORIZATION'));
            if($this->request->getGet('user_id')){
                $db = \Config\Database::connect();
                $build = ['total' => $db->table('app_article')->where('user_id', $this->request->getGet('user_id'))->countAllResults()];
                return $this->respond($build);
            }
            else{
                if(!empty($check->{'message'}) && $check->message == 'Access Granted'){
                    $db = \Config\Database::connect();
                    $build = ['total' => $db->table('app_article')->where('user_id', $check->data->id)->countAllResults()];
                    return $this->respond($build);
                }
            }
        }
        if($this->request->getGet('default')){
            $data = [
                'data' => $this->model->select('app_article.*, app_user.name, app_user.avatar, app_user.location, app_user.gender')
                ->join('app_user', 'app_article.user_id = app_user.id')->where('app_article.status', 'public')->orderBy('app_article.id', 'RANDOM')->paginate(9)
            ];
            return $this->respond($data);
        }
    }
    public function show($id = null)
    {
        $data = $this->model->select('app_article.*, app_user.name, app_user.avatar, app_user.bio, app_user.gender')
        ->join('app_user', 'app_article.user_id = app_user.id')
        ->where('app_article.id', $id)->get()->getRow();
        return $this->respond($data);
    }
    public function create()
    {
        $validation =  \Config\Services::validation();
        $validation->setRules([
            'category_id' => 'required',
            'title' => 'required|min_length[5]|max_length[100]',
            'description' => 'required|max_length[255]',
            'content' => 'required|min_length[5]',
            'image' => 'uploaded[image]|max_size[image,5120]'
        ]);
        if($validation->withRequest($this->request)->run() === true)
        {
            $check = $this->protect->check($this->request->getServer('HTTP_AUTHORIZATION'));
            if(!empty($check->{'message'}) && $check->message == 'Access Granted'){
                $files = $this->request->getFile('image');
                $files->move(WRITEPATH.'uploads/'. $check->data->id);
            	$this->model->insert_data([
                    'user_id' => $check->data->id,
                    'category_id' => $this->request->getPost('category_id'),
                    'title' => $this->request->getPost('title'),
                    'content' => $this->request->getPost('content'),
                    'description' => $this->request->getPost('description'),
                    'image' => $files->getName(),
                    'status' => $this->request->getPost('status'),
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
                return $this->respond(['message' => 'Successfuly add data']);
            }else{
                return $this->respond(['message' => 'Access Denied'], 401);
            }
        }else{
            return $this->respond(['message' => $validation->listErrors()], 403);
        }
    }
    public function update($id = null)
    {
        $validation =  \Config\Services::validation();
        $validation->setRules([
            'category_id' => 'required',
            'title' => 'required|min_length[5]|max_length[100]',
            'description' => 'required|max_length[255]',
            'content' => 'required|min_length[5]',
        ]);
        if($validation->withRequest($this->request)->run() === true)
        {
            $check = $this->protect->check($this->request->getServer('HTTP_AUTHORIZATION'));
            if(!empty($check->{'message'}) && $check->message == 'Access Granted'){
                $data = $this->request->getJSON(true);
                if($this->request->getFile('image')) {
                    $files = $this->request->getFile('image');
                    $files->move(WRITEPATH.'uploads/'. $check->data->id);
                    $data['image'] = $files->getName();
                }
                $data['updated_at'] = date('Y-m-d H:i:s');
            	$this->model->update_data($data, $id);
                return $this->respond(['message' => 'Successfuly update data']);
            }else{
                return $this->respond(['message' => 'Access Denied'], 401);
            }
        }else{
            return $this->respond(['message' => $validation->listErrors()], 403);
        }
    }
    public function delete($id = null)
    {
        $check = $this->protect->check($this->request->getServer('HTTP_AUTHORIZATION'));
        if(!empty($check->{'message'}) && $check->message == 'Access Granted'){
        	$this->model->delete_data($id);
            return $this->respond(['message' => 'Successfuly delete data']);
        }else{
            return $this->respond(['message' => 'Access Denied'], 401);
        }
    }
    public function category($id = null)
    {
        $data = [
            'data' => $this->model->select('app_article.*, app_user.name, app_user.avatar')
            ->join('app_user', 'app_article.user_id = app_user.id')->where(['app_article.category_id' => $id, 'app_article.status' => 'public'])
            ->whereNotIn('app_article.id', [$this->request->getGet('article_id')])
            ->orderBy('app_article.id', 'RANDOM')->paginate(8),
            'pager' => $this->model->pager->links()
        ];
        return $this->respond($data);
    }
    public function search()
    {
        $check = $this->protect->check($this->request->getServer('HTTP_AUTHORIZATION'));
        if(!empty($check->{'message'}) && $check->message == 'Access Granted'){
            $order_status = 'ASC';
            $this->request->getGet('order_status') == 'true' ? $order_status = 'DESC': false;
            if($check->data->type == '5')
            {
                $data = $this->model->onSearch(['app_article.status' => 'public'], [$this->request->getGet('order_by'), $order_status], $this->request->getGet('q'), 25, true);
                return $this->respond($data);
            }
            else{
                $data = $this->model->onSearch(['app_article.user_id' => $check->data->id], [$this->request->getGet('order_by'), $order_status], $this->request->getGet('q'), 25, true);
                return $this->respond($data);
            }
        }
    }
}