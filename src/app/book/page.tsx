import { BookPageController } from "../_book/BookPageController";
import { createBookPageViewModel } from "../../features/book/application/book-page-service";

export default function BookPage() {
  return <BookPageController initialViewModel={createBookPageViewModel()} />;
}
