# Structure progamming
## API for ABC shopwear
## Usage
- Information of products that are stored in a particular warehouse
- GET: /statistics/warehouse/:warehouse_id
- Example: /statistics/warehouse/123

- For transferring purpose, this api return information of particular product that stored in other warehouses
- GET: /statistics/product/:id/:warehouse
- Example: /statistics/product/1234/123

- Information about returned products
- GET: /statistics/product/returned

- Profit correspond to each warehouse
- GET: /statistics/profit/:warehouse
- Example: /statistics/profit/123

- Information of every warehouses
- GET: /warehouse

- Total quantity of each product, which is stored in every warehouse
- GET: /statistics/product

- Add product into a warehouse
- POST: /product/add
- body: {
    id: "",
    name: "",
    type: "",
    price: "",
    description: "",
    size: "",
    image: "",
    video: "",
    color: "",
    quantity: "",
}