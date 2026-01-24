import { routes } from '@cedarjs/router'

import { Button } from 'src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'src/components/ui/card'
import { Separator } from 'src/components/ui/separator'

const content = {
  hero: {
    title: 'Better Flooring Estimates. Faster',
    subtitle:
      'Floorkick helps flooring contractors standardize their pricing and build accurate estimates fast.',
    cta: {
      label: 'Start Creating Better Estimates',
      href: routes.signup(),
    },
  },
  problem: {
    title: 'Quick, accurate, and consistent estimates don’t write themselves.',
    body: [
      'Flooring estimates and invoices are still often done on paper or in basic software that’s hard to access later. Finding old jobs, prices, or details usually means digging through files, emails, or folders.',
      'Most estimating and invoicing software is general-purpose. It isn’t built around flooring work, so it either forces you into awkward workflows or tries to act like an accounting system.',
      'floorkick is built specifically for flooring contractors. It’s your contracting business sidekick — designed to keep estimates organized, accessible, and consistent without turning your work into bookkeeping.',
    ],
  },
  coreIdea: {
    title: 'Standardization: Actions + Materials + Context = Rate.',
    items: [
      {
        title: 'Actions',
        description:
          'Work is defined by what you do — install, remove, prep, repair.',
      },
      {
        title: 'Materials',
        description:
          'Tile, hardwood, LVP, carpet, and more — priced consistently across jobs.',
      },
      {
        title: 'Context',
        description:
          'Square or linear feet, patterned carpet, and purpose based rates.',
      },
    ],
  },
  contractorFocus: {
    title: 'Built by a contractor. Built for contractors.',
    body: [
      'Floorkick is being built by a working flooring contractor who deals with estimates, rate sheets, and change orders daily.',
      'That means the app is opinionated in realistic ways: it reflects how flooring work is actually scoped, measured, and priced.',
      'Contractors are the users of Floorkick. Clients and retailers are easy to manage and communicate with, but this tool is for those who do the work.',
    ],
  },
  howItWorks: {
    title: 'How Floorkick works',
    steps: [
      {
        title: 'Create your rate library',
        description:
          'Define pricing once using actions, materials, units, and subcontractor vs retailer rates.',
      },
      {
        title: 'Build estimates fast',
        description:
          'Add billable items directly from your rates. Quantities and totals calculate automatically.',
      },
      {
        title: 'Send and manage',
        description:
          'Send estimates to clients or retailers and track their status as work moves forward. (Coming soon!)',
      },
    ],
  },
  standardization: {
    title: 'Why standardization matters',
    body: [
      'Standardized rates eliminate guesswork. You stop rethinking pricing on every job and start trusting your numbers.',
      'Estimates become faster to build, easier to review, and simpler to explain to clients and retailers.',
      'Just as important, standardization makes your data usable — unlocking reporting and insights that aren’t possible with free-form line items. (Coming soon!)',
    ],
  },
  comingSoon: {
    title: 'What’s coming soon!',
    items: [
      {
        title: 'Invoice management',
        description:
          'Create invoices directly from accepted estimates without re-entering work or pricing.',
      },
      {
        title: 'Email delivery',
        description:
          'Send estimates and invoices directly from Floorkick to clients or retailers.',
      },
      {
        title: 'Job location & reporting',
        description:
          'Capture job locations and unlock installer-focused reporting across actions, materials, and time.',
      },
    ],
  },
  disclaimer: {
    text: 'Floorkick is an estimating and workflow tool only. Pricing and totals are not intended for tax reporting, accounting, or financial compliance.',
  },
  closing: {
    title: 'Built for flooring contractors who care about consistency',
    cta: {
      label: 'Get started',
      href: routes.signup(),
    },
  },
}

export default function SampleHomePage() {
  return (
    <main className="flex flex-col gap-24 px-6 py-16 md:px-12 lg:px-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero */}
      <section className="max-w-5xl mx-auto text-center flex flex-col gap-6">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          {content.hero.title}
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400">
          {content.hero.subtitle}
        </p>
        <div className="flex justify-center">
          <Button
            size="lg"
            asChild
            className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            <a href={content.hero.cta.href}>{content.hero.cta.label}</a>
          </Button>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-4xl mx-auto text-center flex flex-col gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold">
          {content.problem.title}
        </h2>
        {content.problem.body.map((p, i) => (
          <p key={i} className="text-slate-600 dark:text-slate-400">
            {p}
          </p>
        ))}
      </section>

      {/* Core Idea */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-center md:col-span-3">
          {content.coreIdea.title}
        </h2>
        {content.coreIdea.items.map((item, i) => (
          <Card
            key={i}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-600 dark:text-slate-400">
              {item.description}
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Contractor Focus */}
      <section className="max-w-4xl mx-auto flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-center">
          {content.contractorFocus.title}
        </h2>
        {content.contractorFocus.body.map((p, i) => (
          <p key={i} className="text-center text-slate-600 dark:text-slate-400">
            {p}
          </p>
        ))}
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto flex flex-col gap-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center">
          {content.howItWorks.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.howItWorks.steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-2">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Standardization */}
      <section className="max-w-5xl mx-auto flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-center">
          {content.standardization.title}
        </h2>
        {content.standardization.body.map((p, i) => (
          <p key={i} className="text-center text-slate-600 dark:text-slate-400">
            {p}
          </p>
        ))}
      </section>

      {/* Coming Soon */}
      <section className="max-w-6xl mx-auto">
        <Card className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>{content.comingSoon.title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.comingSoon.items.map((item, i) => (
              <div key={i}>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto text-sm text-slate-500 dark:text-slate-500">
        <Separator className="mb-4" />
        <p>{content.disclaimer.text}</p>
      </section>

      {/* Closing CTA */}
      <section className="max-w-5xl mx-auto text-center flex flex-col gap-6">
        <h2 className="text-3xl font-semibold">{content.closing.title}</h2>
        <Button
          size="lg"
          asChild
          className="mx-auto bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
        >
          <a href={content.closing.cta.href}>{content.closing.cta.label}</a>
        </Button>
      </section>
    </main>
  )
}
