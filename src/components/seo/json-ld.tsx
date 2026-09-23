// Экранирование опасных символов перед вставкой JSON-LD в <script>.
// Без этого `</script>` или `<!--` в данных пользователя могут вырваться
// из контекста и выполнить произвольный JS в странице (XSS).
function safeJson(s: string): string {
  return s
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function JsonLd({ data }: { data: object | object[] }) {
  const arr = Array.isArray(data) ? data : [data];
  return (
    <>
      {arr.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(JSON.stringify(d)) }}
        />
      ))}
    </>
  );
}
