import { Helmet } from 'react-helmet-async';

interface MetaProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const Meta = ({
  title = "Welcome to Mern's Shop",
  description = 'We sell the best products for the cheapest price',
  keywords = 'electronics, buy electronics, cheap electronics'
}: MetaProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
};

export default Meta;
