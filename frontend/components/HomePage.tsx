export default function HomePage() {
  const donations = [
    {
      id: 1,
      name: 'Laptop Bekas',
      image:
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853'
    },
    {
      id: 2,
      name: 'Baju Bekas',
      image:
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f'
    }
  ]

  return (
    <div className="container mt-4">
      <h3>Barang Donasi</h3>

      <div className="row">
        {donations.map((item) => (
          <div className="col-md-6 mb-3" key={item.id}>
            <div className="card">
              <img
                src={item.image}
                className="card-img-top"
              />

              <div className="card-body">
                <h5>{item.name}</h5>

                <button className="btn btn-primary">
                  Request
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}