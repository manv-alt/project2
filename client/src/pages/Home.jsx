import Cardcategory from '@/components/Cardcategory'
import Herosection from '@/components/Herosection'
import PopularProducts from '@/components/PopularProducts'
import React from 'react'

const Home = () => {
  return (
    <div>
      {/* 1. Hero Banner Slider */}
      <Herosection/>
      
      {/* 2. Category Circular Grid */}
      <Cardcategory/>
      
      {/* 3. Popular Products (random products) */}
      <PopularProducts/>
      
      {/* 4. Fruits & Vegetables Highlight - Placeholder for future */}
      {/* 5. Offers Banner - Placeholder for future */}
    </div>
  )
}

export default Home
