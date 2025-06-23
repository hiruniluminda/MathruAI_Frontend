import { SiteHeader } from "../site-header";

const Container = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader title={title} />
      <main className="p-5">{children}</main>
    </div>
  );
};

export default Container;
