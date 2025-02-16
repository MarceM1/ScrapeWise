'use client'

import React from 'react'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import Image from 'next/image';

const heroImages = [
	{ imgUrl: '/assets/images/hero-1.svg', alt: 'smartwarch' },
	{ imgUrl: '/assets/images/hero-2.svg', alt: 'bag' },
	{ imgUrl: '/assets/images/hero-3.svg', alt: 'lamp' },
	{ imgUrl: '/assets/images/hero-4.svg', alt: 'air fyer' },
	{ imgUrl: '/assets/images/hero-5.svg', alt: 'chair' },
]

const HeroCarousel = () => {
	return (
		<div className='hero-carousel'>
			<Carousel
			showThumbs={false}
			autoPlay
			infiniteLoop
			interval={2000}
			showArrows={false}
			showStatus={false}
		>
			{heroImages.map(({ imgUrl, alt }) => (

				<Image key={alt} src={imgUrl} alt={alt} width={484} height={484} className='object-contain' />

			))}
		</Carousel>
		<Image className='max-xl:hidden absolute -left-[15%] bottom-0 z-0' src={'/assets/icons/hand-drawn-arrow.svg'} width={175} height={175} alt='arrow'/>
		</div>
	)
}

export default HeroCarousel