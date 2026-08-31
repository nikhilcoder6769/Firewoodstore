import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  schema?: Record<string, any>;
}

export function SEO({
  title = "Firewood - Premium Digital Assets for Creators",
  description = "Discover premium digital assets, CC (Colour Correction), templates, and thumbnails for content creators, editors, and motion designers.",
  type = "website",
  image = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
  schema
}: SEOProps) {
  const currentUrl = window.location.href;
  
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Firewood Assets",
    "url": "https://firewood-assets.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://firewood-assets.com/products?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={currentUrl} />
      
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
    </Helmet>
  );
}
