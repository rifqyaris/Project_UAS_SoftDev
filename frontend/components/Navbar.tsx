type Props = {
  page: string
  setPage: (page: string) => void
}

export default function Navbar({ page, setPage }: Props) {
  return (
    <div className="navbar-custom">
      <h4>DonasiKu</h4>

      <div className="d-flex gap-3">
        <button onClick={() => setPage('home')}>
          Home
        </button>

        <button onClick={() => setPage('upload')}>
          Upload
        </button>

        <button onClick={() => setPage('tracking')}>
          Tracking
        </button>
      </div>
    </div>
  )
}