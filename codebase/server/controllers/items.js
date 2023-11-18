import pool from '../config/database.js'

const createItem = async (req, res) => {
    try{
        const { name, metal, color, price, type, description, image_url, quantity } = req.body
        const results = await pool.query(
            'INSERT INTO items (title, metal, color, price, type, description, img_url, quantity) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, metal, color, price, type, description, image_url, quantity]
          )
        res.status(201).json(results.rows[0])

    } catch (error) {
        res.status(409).json( { error: error.message } )
    }

}

const filterItems = async (req, res) => {
  try {
    const { minPrice, maxPrice, color, type, metal } = req.query;

    const queryValues = [];
    const queryParams = [];

    if (minPrice !== undefined) {
      queryValues.push(`price >= $${queryParams.length + 1}`);
      queryParams.push(minPrice);
    }

    if (maxPrice !== undefined) {
      queryValues.push(`price <= $${queryParams.length + 1}`);
      queryParams.push(maxPrice);
    }

    if (color) {
      queryValues.push(`color = $${queryParams.length + 1}`);
      queryParams.push(color);
    }

    if (type) {
      queryValues.push(`type = $${queryParams.length + 1}`);
      queryParams.push(type);
    }

    if (metal) {
      queryValues.push(`metal = $${queryParams.length + 1}`);
      queryParams.push(metal);
    }

    let query = `SELECT * FROM items`;

    if (queryValues.length > 0) {
      query += ` WHERE ${queryValues.join(' AND ')}`;
    }

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
};

  const getItems = async (req, res) => {
    try{
        const results = await pool.query('SELECT * FROM items ORDER BY id ASC')
        res.status(200).json(results.rows)
    } catch (error) {
        res.status(409).json( { error: error.message } )
    }
}

const getItem = async (req, res) => {
    try{
        const id = parseInt(req.params.id)
        const results = await pool.query('SELECT * FROM items WHERE id = $1', [id])
        res.status(200).json(results.rows[0])

    } catch (error) {
      res.status(409).json( { error: error.message } )
      console.log('Unable to get item')
      console.log('Error:', error.message)
    }

} 

const updateItem = async (req, res) => {
    try {
      const { title, metal, color, price, type, description, img_url, quantity } = req.body
      const id = parseInt(req.params.id)
  
      const results = await pool.query('UPDATE items SET title=$1, metal=$2, color=$3, price=$4, type=$5, description=$6, img_url=$7, quantity=$8 WHERE id = $9',
        [title, metal, color, price, type, description, img_url, quantity, id]
      )
  
      res.status(200).json(results.rows);
    }
    catch(error){
      res.status(409).json( { error: error.message } )
    }
  }

  const deleteItem = async (req, res) => {
    const id = parseInt(req.params.id)
  
    try {
      const saved_deletion = await pool.query('DELETE FROM users_saved_items WHERE item_id = $1',
        [id]
      )
      const cart_deletion = await pool.query('DELETE FROM users_cart_items WHERE item_id = $1',
        [id]
      )
  
      const results = await pool.query('DELETE FROM items WHERE id = $1', [id])
      res.status(200).json(results.rows)
    }
    catch(error) {
      res.status(409).json( { error: error.message } )
    }
      
  }

  export default {
    createItem,
    filterItems,
    getItems,
    getItem,
    updateItem,
    deleteItem
  }


  