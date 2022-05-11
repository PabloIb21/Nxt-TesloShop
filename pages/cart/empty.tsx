import NextLink from 'next/link';

import { Box, Link, Typography } from '@mui/material';
import { RemoveShoppingCartOutlined } from '@mui/icons-material';
import { ShopLayout } from '../../components/layouts';

const EmptyPage = () => {
  return (
    <ShopLayout title='Carrito vacío' pageDescription='No hay artículos en el carrito de compras'>
      <Box display='flex' sx={{ flexDirection: { xs: 'column', sm:' row' } }} justifyContent='center' alignItems='center' height='calc(100vh - 200px)'>
        <RemoveShoppingCartOutlined sx={{ fontSize: 100 }} />
        <Box display='flex' flexDirection='column' alignItems='center'>
          <Typography>Su carrito está vacío</Typography>
          <NextLink href='/' passHref>
            <Link typography='h4' color='secondary'>Regresar</Link>
          </NextLink>
        </Box>
      </Box>
    </ShopLayout>
  )
}

export default EmptyPage;