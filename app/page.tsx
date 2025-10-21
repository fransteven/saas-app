import CompanionCard from '@/components/CompanionCard'
import CompanionList from '@/components/CompanionList'
import CTA from '@/components/CTA'
import { Button } from '@/components/ui/button'
import { recentSessions } from '@/constants'
import React from 'react'

const Page = () => {
  return (
    <main>
      <h1 className='text-2x underline'>Popular Companions</h1>
      <section className='home-section'>
        <CompanionCard 
          id='123'
          name='Neura the Brain Explorer'
          topic='Neural Network of the Brain'
          subject='science'
          duration={45}
          color='#ffda6e'
        />
        <CompanionCard 
          id='456'
          name='Countsy the Number Wizard'
          topic='Deratives and Integrals'
          subject='maths'
          duration={30}
          color='#35d0ff'
        />
        <CompanionCard 
          id='789'
          name='Verba the Vocabulary Builder'
          topic='English Literature'
          subject='language'
          duration={30}
          color='#bd37ff'
        />
      </section>
      <section className='home-section'>
        <CompanionList 
          title="Recently completed sessions"
          companions={recentSessions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  )
}

export default Page