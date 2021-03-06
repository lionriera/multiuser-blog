<?php namespace App\Models;

use CodeIgniter\Model;

class ArticleModel extends Model
{
	protected $table      = 'app_article';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = false;

    protected $allowedFields = ['user_id', 'category_id', 'title', 'description', 'content', 'image', 'status'];

    protected $useTimestamps = false;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $validationRules    = [];
    protected $validationMessages = [];
    protected $skipValidation     = false;

    public function get_data($id = false)
    {
        if($id === false){
            return $this->table($this->table)
                ->get()
                ->getResultArray();
        } else {
            return $this->table($this->table)
                ->where('id', $id)
                ->get()
                ->getRowArray();
        }   
    }
    public function insert_data($data)
    {
        $this->db->table($this->table)->insert($data);
        return true;
    }
    public function update_data($data, $id)
    {
        return $this->db->table($this->table)->update($data, ['id' => $id]);
    }
    public function delete_data($id)
    {
        return $this->db->table($this->table)->delete(['id' => $id]);
    }
    public function onWhere($where = [], $order = [], $paginate = 16, $like = null, $orLike = null)
    {
        if($like)
        {
            $data = [
                'data' => $this->table($this->table)->select('app_article.*, app_user.name, app_user.avatar, app_user.location, app_user.gender, app_category.name as category_name')
                ->join('app_user', 'app_article.user_id = app_user.id')
                ->join('app_category', 'app_article.category_id = app_category.id')
                ->where($where)->orderBy($order[0], $order[1])
                ->like('app_article.title', $like)
                ->orLike('app_article.id', $like)
                ->orLike('app_article.status', $like)
                ->paginate($paginate)
            ];
            return $data;
        }
        else{
            $data = [
                'data' => $this->table($this->table)->select('app_article.*, app_user.name, app_user.avatar, app_user.location, app_user.gender, app_category.name as category_name')
                ->join('app_user', 'app_article.user_id = app_user.id')
                ->join('app_category', 'app_article.category_id = app_category.id')
                ->where($where)->orderBy($order[0], $order[1])->paginate($paginate)
            ];
            return $data;
        }
    }
    public function onSearch($where = [], $order = [], $search = null, $paginate = 16, $count = null)
    {
        if($count)
        {
            $data = [
                'data' => $this->table($this->table)->where($where)->select('app_article.*, app_user.name, app_user.avatar, app_user.location, app_user.gender, app_category.name as category_name')
                    ->orderBy($order[0], $order[1])
                    ->join('app_user', 'app_article.user_id = app_user.id')
                    ->join('app_category', 'app_article.category_id = app_category.id')
                    ->like('app_article.title', $search)
                    ->paginate($paginate)
            ];
            return $data;
        }
        else{
            $db = \Config\Database::connect();
            $build = $db->table('app_article');
            $data = [
                'data' => $this->table($this->table)->where($where)
                    ->select('app_article.*, app_user.name, app_user.avatar, app_user.location, app_user.gender, app_category.name as category_name')
                    ->join('app_user', 'app_article.user_id = app_user.id')->orderBy($order[0], $order[1])
                    ->join('app_category', 'app_article.category_id = app_category.id')
                    ->like('app_article.title', $search)
                    ->paginate($paginate),
                'total' => $build->where($where)
                    ->join('app_user', 'app_article.user_id = app_user.id')->orderBy($order[0], $order[1])
                    ->join('app_category', 'app_article.category_id = app_category.id')
                    ->like('app_article.title', $search)
                    ->countAllResults()
            ];
            return $data;

        }
    }
}