export const Loader = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
    </div>
  );
};

export const FullPageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Loader />
    </div>
  );
};
