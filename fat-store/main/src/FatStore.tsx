import useSWR from "swr"
import { Container } from "@mui/material";

export default function FatStore() {
  const {
    data: products, isValidating, isLoading
  } = useSWR<{ data: string[] }>(`/dev-api/fatStoreAdmin/products?offset=100`);

  if (isLoading) {
    return (
      <div> Currently loading... </div>
    )
  }

  if (isValidating) {
    return (
      <div> Currently validating... </div>
    )
  }

  return (
    <Container>
      {products?.data.map(pr => pr.toString())}
    </Container>
  )
}
