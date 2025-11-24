import { Helmet } from "react-helmet";

interface ArtistStructuredDataProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  jobTitle?: string;
  sameAs?: string[];
}

export const ArtistStructuredData = ({
  name,
  description,
  url,
  image,
  birthDate,
  birthPlace,
  nationality,
  jobTitle,
  sameAs = [],
}: ArtistStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description,
    url,
    ...(image && { image }),
    ...(birthDate && { birthDate }),
    ...(birthPlace && { birthPlace }),
    ...(nationality && { nationality }),
    ...(jobTitle && { jobTitle }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
