export default function App() {
  return (
    <main className="hello">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={96} height={96} />
      <h1>SababaWords</h1>
      <p>ברוכים הבאים! בקרוב: אנגלית וערבית בכיף 🌱</p>
      <p lang="en" dir="ltr">Hello!</p>
      <p lang="ar" dir="rtl">مرحبا!</p>
    </main>
  )
}
