import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import logo from '../assets/portfolio/logo.png'
import photo from '../assets/portfolio/photo.png'
import quantImage from '../assets/portfolio/quant.jpg'
import varImage from '../assets/portfolio/var.jpg'
import linkedinIcon from '../assets/portfolio/linkedin.svg'
import githubIcon from '../assets/portfolio/github.svg'

function Logo({ size }) {
  return (
    <span
      className="relative shrink-0 overflow-hidden"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src={logo}
        alt=""
        className="absolute max-w-none"
        style={{ left: '-95.83%', top: '-95.83%', width: '291.67%', height: '291.67%' }}
      />
    </span>
  )
}

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Connect', href: '#connect' },
]

const QuantEquityinsightlyText =
  `A full-stack web app for quantitative analysis and portfolio modeling, built with Python 
  and React. Beyond core performance and risk metrics like volatility, drawdowns, Sharpe, Calmar, 
  beta, and alpha, it features comprehensive return distribution analysis, comparative benchmarking, 
  and advanced Monte Carlo simulations (classic, bootstrap, block bootstrap, and GARCH) to project potential future price paths.`
const cardBase = 'rounded-2xl bg-[#FFFFFE] p-6 sm:p-8'
const cardTitle = "font-['Segoe_UI',-apple-system,Roboto,Helvetica,sans-serif] text-[28px] font-bold leading-[1.3] text-[#1E1E1E] sm:text-4xl"
const cardText = "font-['Segoe_UI',-apple-system,Roboto,Helvetica,sans-serif] text-xl/8 text-[#757575]"
const varText = 
  `A full-stack web app for financial risk analysis, built with Python and React. 
  It estimates Value at Risk (VaR) and Conditional Value at Risk 
  (CVaR) using historical stock returns, helping users explore potential losses at a 95% confidence level. 
  Parametric and Monte Carlo methods are planned to provide additional approaches to risk estimation.`
function Tag({ children }) {
  return (
    <span className="flex items-center justify-center gap-2 overflow-hidden rounded-[80px] bg-[#F5F5F5] px-4 py-2 text-base/none font-bold text-[#1E1E1E]">
      {children}
    </span>
  )
}

function ArrowButton() {
  return (
    <svg
      className="shrink-0"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
        fill="white"
        stroke="#F5F5F5"
        strokeWidth="2"
      />
      <path
        d="M23.9277 15.9277L31.9277 23.9277L23.9277 31.9277M31.9277 23.9277H15.9277"
        stroke="#1E1E1E"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MagnifyingGlass() {
  return (
    <svg
      className="shrink-0"
      width="46"
      height="46"
      viewBox="0 0 46 46"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="18" cy="18" r="15" fill="#F1F2F2" />
      <path
        d="m29 29 13 13"
        stroke="#6D747E"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M18 10v16M10 18h16"
        stroke="#007AFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="flex w-full flex-col gap-[27px]">
      <h2 className="font-['Segoe_UI',-apple-system,Roboto,Helvetica,sans-serif] text-5xl font-normal text-black">
        {children}
      </h2>
      <div className="h-0.5 w-full bg-black" />
    </div>
  )
}

export default function Portfolio() {
  const [active, setActive] = useState(0)
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false })
  const itemRefs = useRef([])

  useEffect(() => {
    const root = document.documentElement
    root.style.scrollBehavior = 'smooth'
    return () => {
      root.style.scrollBehavior = ''
    }
  }, [])

  useEffect(() => {
    const update = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let current = 0
      navItems.forEach((item, i) => {
        const el = document.querySelector(item.href)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = i
      })
      setActive(atBottom ? navItems.length - 1 : current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[active]
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth, ready: true })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5] font-['Segoe_UI',-apple-system,Roboto,Helvetica,sans-serif] text-[#1E1E1E]">
      <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center gap-6 px-4 pb-5 sm:px-8 lg:px-16">
        <header className="sticky top-0 z-50 -mx-4 flex flex-wrap items-center justify-center gap-4 self-stretch bg-[#F5F5F5]/70 px-4 pb-2 pt-2 backdrop-blur-md sm:-mx-8 sm:gap-9 sm:px-8 lg:-mx-16 lg:px-16">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
                        <span className="text-[23px] font-black text-black">ZaniApex</span>
          </div>
          <nav
            aria-label="Navigazione portfolio"
            className="relative flex w-full max-w-[440px] items-center gap-1.5 rounded-[60px] border-2 border-[#E5E5E5] bg-[#F7F7F7] p-1.5 backdrop-blur-[2px] sm:w-[440px]"
          >
            <span
              aria-hidden="true"
              className={`absolute bottom-1.5 top-1.5 rounded-full bg-[#1E1E1E] ${
                pill.ready ? 'transition-[left,width] duration-400 ease-in-out' : ''
              }`}
              style={{ left: pill.left, width: pill.width }}
            />
            {navItems.map((item, index) => (
              <a
                key={item.label}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                href={item.href}
                aria-current={index === active ? 'true' : undefined}
                className={`relative z-10 flex flex-1 items-center justify-center rounded-full px-2 py-2.5 text-base/none transition-colors duration-500 sm:px-5 sm:py-3 sm:text-lg/none ${
                  index === active ? 'text-white' : 'text-[#1E1E1E]'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <main className="flex w-full max-w-[1120px] flex-col items-center gap-[35px] pb-[30px]">
          <section
            id="home"
            className="flex w-full flex-col items-center gap-10 overflow-hidden rounded-3xl py-10 sm:py-16"
          >
            <div className="flex w-full flex-wrap items-start gap-6">
              <h1 className="min-w-0 flex-1 basis-[300px] font-['Roboto',-apple-system,Helvetica,sans-serif] text-5xl/[1.1] font-normal text-[#1E1E1E] sm:text-6xl/[64px]">
                Hi, I’m <span className="font-bold">Klesti</span>
              </h1>
              <p className="min-w-0 flex-1 basis-[300px] font-['Roboto',-apple-system,Helvetica,sans-serif] text-2xl/10 font-normal text-[#757575] sm:text-4xl/[64px]">
                a high school senior passionate about <b>mathematics</b> and{' '}
                <b>programming</b>. With a strong drive for building <b>modern</b>{' '}
                digital tools, I focus on keeping a <b>clean</b>, elegant design.
              </p>
            </div>
          </section>

          <section
            id="about"
            className="flex w-full scroll-mt-28 flex-wrap items-start gap-6"
          >
            <div
              className={`${cardBase} flex min-w-0 flex-1 basis-[320px] flex-col gap-6 overflow-hidden border-2 border-[#E5E5E5] lg:basis-[500px]`}
            >
              <h2 className={cardTitle}>About Me</h2>
              <div className={`${cardText} flex flex-col gap-8`}>
                <p>
                  As an 18-year-old with a strong focus on software development,
                  data analysis and mathematical rigor, my work blends backend
                  logic with frontend design, with an emphasis on minimalism,
                  performance, and clean architecture.
                </p>
                <p>
                  Whether I&apos;m building data dashboards or coding web
                  applications, I strive to create seamless user experiences
                  where every element serves a precise purpose.
                </p>
              </div>
            </div>
            <img
              src={photo}
              alt="work example"
              className="h-[390px] min-w-0 flex-1 basis-[280px] rounded-2xl object-cover"
            />
          </section>

          <section
            id="projects"
            className="flex w-full scroll-mt-28 flex-col gap-[35px]"
          >
            <SectionTitle>Projects</SectionTitle>

            <Link
              to="/quantequity"
              className={`${cardBase} flex w-full flex-col items-center gap-6 overflow-hidden border-2 border-[#E5E5E5] transition-colors hover:border-[#1E1E1E]/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E1E1E]`}
            >
              <div className="flex w-full items-center gap-4">
                <h3 className={`${cardTitle} min-w-0 flex-1 truncate`}>
                  QuantEquity DashBoard
                </h3>
                <ArrowButton />
              </div>
              <img
                src={quantImage}
                alt="QuantEquity work example"
                className="h-[200px] w-full rounded-xl object-cover sm:h-[352px]"
              />
              <div className={`${cardBase} flex w-full flex-col gap-6 overflow-hidden border-2 border-[#E5E5E5]`}>
                <div className="flex items-center">
                  <h3 className={`${cardTitle} truncate`}>Insightly</h3>
                  <span className="shrink-0 font-['Arial'] text-[46px] leading-none">💡</span>
                </div>
                <div className="flex w-full flex-col gap-4">
                  <div className={cardText}>
                    <p>{QuantEquityinsightlyText}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['Recharts', 'Garch', 'yfinance', "Pandas"].map((tag, i) => (
                      <Tag key={i}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            </Link>

            <Link
               to="/var-cvar-simulator"
              className={`${cardBase} flex w-full items-center gap-4 border-2 border-[#E5E5E5] transition-colors
               hover:border-[#1E1E1E]/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E1E1E]`}
            >
            <div className="flex w-full flex-wrap items-start gap-6  bg-white">
              <div
                className={`${cardBase} flex min-w-0 flex-1 basis-[300px] flex-col gap-6 overflow-hidden`}
              >
                <div className="flex items-center gap-2.5">
                  <h3 className={`${cardTitle} truncate`}>Insightly</h3>
                  <MagnifyingGlass />
                </div>
                <div className="flex w-full flex-col gap-4 lg:min-h-[288px]">
                  <div className={cardText}>
                    <p>{varText}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {['Scipy', 'Numpy', 'yfinance', "Pandas"].map((tag, i) => (
                      <Tag key={i}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className={`${cardBase} flex min-h-[424px] min-w-0 flex-1 basis-[300px] flex-col gap-6 overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`${cardTitle} min-w-0 flex-1 truncate`}>
                    VaR &amp; CVaR Simulator
                  </h3>
                  <ArrowButton />
                </div>
                <div className="flex min-h-[240px] flex-1 flex-col">
                  <img
                    src={varImage}
                    alt="Anteprima del progetto VaR & CVaR Simulator"
                    className="min-h-0 w-full flex-1 rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
            </Link>
          </section>

          <section
            id="connect"
            className="flex w-full scroll-mt-28 flex-col items-center gap-8"
          >
            <SectionTitle>Connect</SectionTitle>
            <div className="flex w-full flex-wrap justify-center gap-6">
              <a
                href="https://www.linkedin.com/in/klesti-zani-8a24a03b2"
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 basis-[280px] items-center justify-center gap-6 overflow-hidden rounded-2xl border-2 border-[#E5E5E5] bg-[#FFFFFE] px-6 py-4 text-2xl transition-colors hover:bg-[#F5F5F5]"
              >
                <img src={linkedinIcon} alt="" className="size-10" />
                LinkedIn
              </a>
              <a
                href="https://github.com/Klesti-Zani"
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 basis-[280px] items-center justify-center gap-6 overflow-hidden rounded-2xl border-2 border-[#E5E5E5] bg-[#FFFFFE] px-6 py-4 text-2xl transition-colors hover:bg-[#F5F5F5]"
              >
                <img src={githubIcon} alt="" className="size-10" />
                GitHub
              </a>
            </div>
          </section>
        </main>

        <footer className="flex w-full flex-wrap items-center gap-x-8 gap-y-4 px-6 py-4 lg:h-20 lg:flex-nowrap lg:py-0">
          <div className="flex max-w-[1000px] flex-1 flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-[30px]">
              <div className="flex items-center gap-2.5">
                <Logo size={32} />
                <span className="text-xl font-black text-black">ZaniApex</span>
              </div>
              <a href="mailto:info@zaniapex.it" className="text-base text-black">
                info@zaniapex.it
              </a>
            </div>
            <p className="text-sm font-light text-black">
              © 2026 ZaniApex by Klesti Zani. All rights reserved.
            </p>
          </div>
          <a
            href="#home"
            className="flex h-[41px] items-center justify-center rounded-lg border-[0.5px] border-black bg-[#FFFDF8] px-4 py-2.5 text-lg text-black transition-colors hover:bg-[#F5F5F5]"
          >
            Back to top ↑
          </a>
        </footer>
      </div>
    </div>
  )
}
