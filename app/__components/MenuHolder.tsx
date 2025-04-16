function MenuHolder({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="fixed bottom-14 right-4 flex gap-2">{children}</div>;
}

export default MenuHolder;
