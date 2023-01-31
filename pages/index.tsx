import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

import mapToJSX from '../utilities/mapToJSX';
import LaunchCard from '../components/Launch';
import SimpleGrid from '../components/SimpleGrid';

interface HomeProps {
  preloadData: Launch[];
  apiUrl: string;
}

const { PUBLIC_URL, API_SLUG } = process.env;
const TIMEOUT = 10000;

// This gets called on every request
export async function getServerSideProps() {
  const apiURL = `${PUBLIC_URL}${API_SLUG}`;
  const { data } = await axios.get<Launch[]>(apiURL);
  // Pass data to the page via props
  return { props: { preloadData: data, apiUrl: apiURL } };
}

export default function Home(props: HomeProps) {
  const { preloadData, apiUrl } = props;
  const [launches, setLaunches] = useState<Launch[]>(preloadData);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetchLaunches = async () => {
    clearTimeout(timeoutRef.current);
    const { data } = await axios.get<Launch[]>(apiUrl);
    timeoutRef.current = setTimeout(fetchLaunches, TIMEOUT);
    setLaunches(data);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(fetchLaunches, TIMEOUT);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <>
      <Head>
        <title>SpaceX Launch API</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SimpleGrid>
        {({ activeId, setActiveId }) =>
          mapToJSX(launches, (props) => (
            <LaunchCard {...props} showStatus={activeId === props.id} onButtonClick={setActiveId} />
          ))
        }
      </SimpleGrid>
    </>
  );
}
