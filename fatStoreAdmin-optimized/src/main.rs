use actix_web::{self, main, web, HttpServer, App, get, post, Responder, HttpResponse};

#[main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(echo)
            .service(manual_hello)
            .service(
                web::scope("/test")
                    .service(first_test)
            )
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

#[post("/echo")]
async fn echo(req_body: String) -> impl Responder {
    HttpResponse::Ok().body(req_body)
}

#[get("/hey")]
async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

#[get("/first-test")]
async fn first_test() -> impl Responder {
    HttpResponse::Found().body("first test")
}
