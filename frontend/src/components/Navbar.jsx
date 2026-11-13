
const Navbar = () => {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white pl-16 pr-4 sm:px-6">
      <div className="min-w-0">
          <h2 className="text-xl font-semibold text-slate-800">
            Employee Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage your organization
          </p>
      </div>

      {/* <div className="hidden shrink-0 sm:block">
        <p className="text-sm font-semibold text-slate-800">
          Inderjeet Singh
        </p>
      </div> */}
    </header>
  );
};

export default Navbar;
