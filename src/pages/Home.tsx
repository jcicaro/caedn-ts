import React, { useMemo, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import rawMenu from '../data/menu.json';

// JSON shapes
interface RawMenuItem {
  name?: string;
  title?: string;
  desc?: string;
  link: string;
}

interface RawMenuCategory {
  category: string;
  items: RawMenuItem[];
}

interface CardItem {
  title: string;
  desc: string;
  link: string;
}

const getSiteName = (): string => {
  const host = window.location.hostname.replace(/^www\./, '');
  const subdomain = host.split('.')[0];

  const siteNames: Record<string, string> = {
    luna: 'LunaLearn',
    project: 'Project Icaro',
  };

  return siteNames[subdomain] ?? 'Project Icaro';
};

const Home: React.FC = () => {
  // Site and origin
  const siteName = useMemo(() => getSiteName(), []);
  const origin = window.location.origin;

  // Filter state
  const [filter, setFilter] = useState('');
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  // Parse JSON into categories of cards, excluding the Home link
  const categorizedItems = useMemo(() => {
    const data = rawMenu as RawMenuCategory[];
    return data.map((cat) => ({
      category: cat.category,
      items: cat.items
        .filter((item) => item.link !== '/')
        .map<CardItem>((item) => ({
          title: item.title ?? item.name ?? '',
          desc: item.desc ?? '',
          link: item.link,
        })),
    }));
  }, []);

  // Apply filter to categories and items
  const filteredCategories = useMemo(
    () => {
      const term = filter.toLowerCase();
      return categorizedItems
        .map((cat) => {
          // If category matches, include all its items
          if (cat.category.toLowerCase().includes(term)) {
            return cat;
          }
          // Otherwise filter items by title, desc, or link
          const items = cat.items.filter((item) =>
            item.title.toLowerCase().includes(term) ||
            item.desc.toLowerCase().includes(term) ||
            item.link.toLowerCase().includes(term)
          );
          return {
            category: cat.category,
            items,
          };
        })
        .filter((cat) => cat.items.length > 0);
    },
    [categorizedItems, filter]
  );

  return (
    <div className="min-h-screen bg-base-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-primary mb-6">
          Welcome to {siteName}
        </h1>
        <p className="text-lg text-base-content mb-6">
          Explore our interactive learning tools for young minds. From basic
          math to storytelling, Luna and friends are here to guide your child
          every step of the way!
        </p>

        {/* Filter Input */}
        <div className="flex input-group mb-8">
          <input
            type="text"
            placeholder="Filter tools..."
            value={filter}
            onChange={handleFilterChange}
            className="input input-bordered flex-1"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="btn btn-square btn-outline"
              aria-label="Clear filter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Render categories and cards */}
        {filteredCategories.map(({ category, items }) => (
          <section key={category} className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">{category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map(({ title, desc, link }) => (
                <Card key={link} title={title} desc={desc} link={link} />
              ))}
            </div>
          </section>
        ))}
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
