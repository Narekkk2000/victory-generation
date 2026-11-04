import { useLayoutEffect } from 'react'
import { contactEmail } from '../data'
import Icon from './Icon'
import '../contact.css'

export default function ContactPage() {
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [])

  return <main className="contact-page">
    <div className="contact-page-content">
      <p className="contact-intro">This is just a glimpse, more projects await to be discovered</p>
      <h1>Let’s make<br />great brands<br />together!</h1>
      <address className="contact-details">
        <div>
          <span>Email</span>
          <a href={`mailto:${contactEmail}`}>{contactEmail}<Icon name="arrow" size={24} /></a>
        </div>
        <div>
          <span>Phone Number</span>
          <a href="tel:+16268888448">+1 (626) 888-8448<Icon name="arrow" size={24} /></a>
        </div>
      </address>
    </div>
  </main>
}
