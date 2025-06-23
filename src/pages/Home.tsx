// export default function Home() {
//     return <>

//         <div className="mockup-browser border-base-300 border w-full">
//             <div className="mockup-browser-toolbar">
//                 <div className="input">https://daisyui.com</div>
//             </div>
//             <div className="grid place-content-center border-t border-base-300 h-80">Home Page: Hello, Luna and Zac!</div>
//         </div>

//     </>;
// }

import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-base-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-primary mb-6">Welcome to LunaLearn</h1>
        <p className="text-lg text-base-content mb-12">
          Explore our interactive learning tools for young minds. From basic math to storytelling, Luna and friends are here to guide your child every step of the way!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* <Card
            title="About Us"
            desc="Learn more about our mission, vision, and the team behind CAEDN."
            link="/about"
          /> */}
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
            title="Luna's Speech"
            desc="Generate example Luna's educational speeches made just for kids."
            link="/lunaspeech"
          />
          <Card
            title="Luna's Narrative"
            desc="Generate example Luna's educational narratives made just for kids."
            link="/lunanarrative"
          />
          <Card
            title="Luna's Teacher Chat"
            desc="Talk to a teacher and learn new interesting things."
            link="/lunachat"
          />
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, desc, link }: { title: string; desc: string; link: string }) => (
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
