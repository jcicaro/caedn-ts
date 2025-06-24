import React from "react";
import { Link } from "react-router-dom";

const getSiteName = (): string => {
  // strip any www.
  const host = window.location.hostname.replace(/^www\./, "");
  // pull out subdomain (e.g. "luna" from "luna.icaro.com.au")
  const subdomain = host.split(".")[0];

  const siteNames: Record<string, string> = {
    luna: "LunaLearn",
    project: "Icaro Project",
  };

  // return mapped name or default
  return siteNames[subdomain] ?? "LunaLearn";
};

const Home: React.FC = () => {
  const siteName = React.useMemo(() => getSiteName(), []);
  const origin = window.location.origin;

  return (
    <div className="min-h-screen bg-base-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-primary mb-6">
          Welcome to {siteName}
        </h1>
        {/* <p className="text-sm opacity-50 mb-2">
          (You’re browsing: {origin})
        </p> */}
        <p className="text-lg text-base-content mb-12">
          Explore our interactive learning tools for young minds. From basic
          math to storytelling, Luna and friends are here to guide your child
          every step of the way!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Basic Math"
            desc="Start learning numbers and operations with simple visual maths problems."
            link="/basicmath"
          />
          <Card
            title="Multiplication"
            desc="Practice your times tables with dynamic multiplication exercises."
            link="/multiplication"
          />
          <Card
            title="Luna’s Speech"
            desc="Generate example Luna’s educational speeches made just for kids."
            link="/lunaspeech"
          />
          <Card
            title="Luna’s Narrative"
            desc="Generate example Luna’s educational narratives made just for kids."
            link="/lunanarrative"
          />
          <Card
            title="Luna’s Teacher Chat"
            desc="Talk to a teacher and learn new interesting things."
            link="/lunachat"
          />
        </div>
      </div>
    </div>
  );
};

const Card = ({
  title,
  desc,
  link,
}: {
  title: string;
  desc: string;
  link: string;
}) => (
  <div className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-200">
    <div className="card-body">
      <h2 className="card-title">{title}</h2>
      <p>{desc}</p>
      <div className="card-actions justify-end mt-4">
        <Link to={link} className="btn btn-primary btn-sm">
          Explore
        </Link>
      </div>
    </div>
  </div>
);

export default Home;
