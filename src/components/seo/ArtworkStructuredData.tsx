import { Helmet } from "react-helmet";

interface ArtworkStructuredDataProps {
  name: string;
  description: string;
  image: string;
  creator: string;
  dateCreated: string;
  artMedium: string;
  artform: string;
  width?: string;
  height?: string;
  url: string;
}

export const ArtworkStructuredData = ({
  name,
  description,
  image,
  creator,
  dateCreated,
  artMedium,
  artform,
  width,
  height,
  url,
}: ArtworkStructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name,
    description,
    image,
    creator: {
      "@type": "Person",
      name: creator,
    },
    dateCreated,
    artMedium,
    artform,
    ...(width && height && {
      width: {
        "@type": "QuantitativeValue",
        value: width,
      },
      height: {
        "@type": "QuantitativeValue",
        value: height,
      },
    }),
    url,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};
