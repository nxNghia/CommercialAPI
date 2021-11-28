# Structure progamming
## API for ABC shopwear
### Retrieve product API
#### by product ids
```
http://[hostname]/products/id/:id
```
> Example: http://localhost:8000/products/id/1,2,3
#### by product brand
```
http://[hostname]/products/brand/:brand
```
> Example: http://localhost:8000/products/brand/Nike,Adidas
#### by model name
```
http://[hostname]/products/name/:name
```
> Example: http://localhost:8000/products/name/nmd_r1%20v2
#### by model id
```
http://[hostname]/products/model/:model
```
> Example: http://localhost:8000/products/model/1,2,3
#### by product type
```
http://[hostname]/products/type/:type
```
> Example: http://localhost:8000/products/type/nmd
#### by price
```
http://[hostname]/products/min_price/:min_price
```
```
http://[hostname]/products/max_price/:max_price
```
```
http://[hostname]/products/min_price/:min_price/max_price/:max_price
```
> Example: http://localhost:8000/products/min_price/1500000/max_price/3000000
