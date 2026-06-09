export default function UploadPage() {
  return (
    <div className="container mt-4">
      <h3>Upload Barang</h3>

      <form>
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Nama Barang"
        />

        <textarea
          className="form-control mb-3"
          placeholder="Deskripsi"
        />

        <button className="btn btn-success">
          Submit
        </button>
      </form>
    </div>
  )
}