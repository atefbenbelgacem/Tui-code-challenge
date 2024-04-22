import express, { Request, Response, NextFunction } from 'express';
//import json from 'body-parser';
import fetch from 'node-fetch';
import { Product, CartContent, User } from './types';

const app = express();

/*
Using the Json middleware from body-parser is deprecated
Changed this to a better way by using the Json middleware from express
*/
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.get('/products', async (req: Request, res: Response) => {

  try {
    // Added the select querry param to select specific fields that match the interface
    const response = await fetch('https://dummyjson.com/products?limit=100&select=title,description,price,thumbnail');

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data: any = await response.json();

    if (!Array.isArray(data.products)) {
      throw new Error('Products data is not an array');
    }

    const products: Product[] = data.products;

    products.sort((a: Product, b: Product) => a.title.localeCompare(b.title));

    res.status(200).json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    const response = await fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    /*
    Choosed to check for the 400 status code because
    that's what is being returned by the dummyjson API
    */
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Invalid credentials');
      } else {
        throw new Error('Failed to authenticate user');
      }
    }

    const data: any = await response.json();
    const user: User = {
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.image,
      token: data.token,
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error('Error authenticating user:', error);
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: 'Invalid credentials' });
    } else if (error.message === 'Username and password are required') {
      res.status(400).json({ error: 'Missing crendentials' });
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});

/* app.post('/cart', async (req: Request, res: Response) => {
  const cartContent: CartContent;
  res.send(cartContent);
}); */

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send();
});

export default app;
