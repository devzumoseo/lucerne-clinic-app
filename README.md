# Domain Lions Website

A modern, responsive website for Domain Lions, a premium domain name marketplace built with Next.js and Chakra UI.

## Features

- **Responsive Design**: Fully responsive layout that works on all devices
- **Modern UI**: Built with Chakra UI for a clean, modern aesthetic
- **TypeScript Support**: Type-safe code with TypeScript
- **SEO Optimized**: Built with SEO best practices
- **Fast Performance**: Optimized for speed and performance
- **Animations**: Subtle animations enhance user experience
- **Dark Mode Support**: Toggle between light and dark themes

## Pages

- **Home**: Showcase of services with features, testimonials, stats, and FAQs
- **Domains**: Searchable listing of available domain names
- **About**: Company information, team members, and values
- **Contact**: Contact form and company information
- **Blog** (placeholder): Ready for blog content
- **FAQ** (placeholder): Ready for expanded FAQ content

## Components

The website includes several reusable section components:

- **Hero**: Three variants (centered, split, with background)
- **Features**: Grid layout for showcasing features
- **Testimonials**: Display customer testimonials
- **Stats**: Animated stats display
- **FAQ**: Accordion-style FAQ section
- **CTA**: Call-to-action sections
- **Pricing**: Service tier display

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/domain-lions.git
   cd domain-lions
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
domain-lions/
├── public/             # Static assets
│   └── images/         # Image assets
├── src/                # Source code
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   │   ├── layout/     # Layout components
│   │   └── sections/   # Section components
│   ├── theme/          # Chakra UI theme
│   └── styles/         # Global styles
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## Customization

### Theme

The theme is defined in `src/theme/` and can be customized to match your brand:

- **Colors**: Update primary and accent colors in `src/theme/foundations/colors.ts`
- **Typography**: Modify fonts in `src/theme/foundations/typography.ts`
- **Components**: Customize component styles in `src/theme/components/`

### Content

Update content in the respective page files:

- Home page: `src/app/page.tsx`
- Domains page: `src/app/domains/page.tsx`
- About page: `src/app/about/page.tsx`
- Contact page: `src/app/contact/page.tsx`

## Deployment

This website can be deployed to any hosting service that supports Next.js applications, such as:

- [Vercel](https://vercel.com/) (recommended for Next.js)
- [Netlify](https://www.netlify.com/)
- [AWS Amplify](https://aws.amazon.com/amplify/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [React Intersection Observer](https://github.com/thebuilder/react-intersection-observer)
# lucerne-clinic-app
