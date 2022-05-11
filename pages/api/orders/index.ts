import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

import { IOrder } from '../../../interfaces';
import { db } from '../../../database';
import { Order, Product } from '../../../models';

type Data = 
| { message: string }
| IOrder;

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  switch (req.method) {
    case 'POST':
      return createOrder(req, res);
    default:
      res.status(400).json({ message: 'Bad request' });
  }
}

const createOrder = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  const { orderItems, total } = req.body as IOrder;

  const session: any = await getSession({ req });
  if ( !session ) {
    return res.status(401).json({ message: 'Debe estar autenticado para hacer esto' });
  }

  const productsIds = orderItems.map(product => product._id);
  await db.connect();

  const dbProducts = await Product.find({ _id: { $in: productsIds } });

  try {
    const subTotal = orderItems.reduce( (prev, current) => {
      const currentPrice = dbProducts.find( prod => prod.id === current._id)?.price;
      if ( !currentPrice ) {
        throw new Error('Producto no encontrado');
      }

      return (current.quantity * currentPrice) + prev
    }, 0);

    const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
    const backendTotal = subTotal * ( taxRate + 1 );

    if ( backendTotal !== total ) {
      throw new Error('El total no coincide');
    }

    const userId = session.user._id;
    const newOrder = new Order({ ...req.body, isPaid: false, user: userId });
    newOrder.total = Math.round( newOrder.total * 100 ) / 100;

    await newOrder.save();
    await db.disconnect();

    return res.status(201).json( newOrder );
  } catch (error: any) {
    await db.disconnect();
    console.log(error);
    return res.status(400).json({ 
      message: error.message || 'Revise logs del servidor'
    });
  }
}
