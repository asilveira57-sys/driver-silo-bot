import { SEOHead } from "@/components/SEOHead";
import { LegalLayout } from "@/components/legal/LegalLayout";

export default function LGPDPage() {
  return (
    <>
      <SEOHead
        title="LGPD - Lei Geral de Proteção de Dados"
        description="Saiba como a Adeconex Drivers trata dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018)."
        canonical="https://www.adeconex.com/lgpd"
      />
      <LegalLayout
        title="LGPD — Lei Geral de Proteção de Dados"
        intro={
          <>
            <p>A <strong>Adeconex Drivers</strong> respeita a privacidade, segurança e proteção dos dados pessoais dos usuários, em conformidade com a Lei Geral de Proteção de Dados Pessoais — Lei nº 13.709/2018 (LGPD).</p>
            <p>Esta página explica de forma transparente como os dados podem ser coletados, utilizados e protegidos durante a utilização do portal.</p>
          </>
        }
      >
        <h2>1. Compromisso com a proteção de dados</h2>
        <p>A Adeconex adota medidas técnicas e administrativas voltadas para proteção das informações pessoais dos usuários, buscando garantir:</p>
        <ul>
          <li>Segurança dos dados</li>
          <li>Transparência no tratamento das informações</li>
          <li>Uso responsável das informações coletadas</li>
          <li>Respeito à privacidade</li>
          <li>Conformidade com a legislação brasileira</li>
        </ul>

        <h2>2. Dados que podem ser coletados</h2>
        <p>Durante a navegação no portal, poderão ser coletados dados como:</p>
        <ul>
          <li>Endereço IP</li>
          <li>Navegador utilizado</li>
          <li>Tipo de dispositivo</li>
          <li>Sistema operacional</li>
          <li>Páginas acessadas</li>
          <li>Tempo de navegação</li>
          <li>Cookies</li>
          <li>Informações enviadas voluntariamente pelo usuário</li>
        </ul>

        <h2>3. Finalidade do tratamento de dados</h2>
        <ul>
          <li>Melhorar a experiência de navegação</li>
          <li>Garantir funcionamento correto do portal</li>
          <li>Exibir conteúdos relevantes</li>
          <li>Gerar estatísticas e análises</li>
          <li>Cumprir obrigações legais</li>
          <li>Garantir segurança da plataforma</li>
          <li>Exibir publicidade compatível com os interesses do usuário</li>
        </ul>

        <h2>4. Compartilhamento de dados</h2>
        <p>A Adeconex não comercializa dados pessoais. Os dados poderão ser compartilhados apenas quando necessário para:</p>
        <ul>
          <li>Prestação de serviços tecnológicos</li>
          <li>Funcionamento de ferramentas integradas</li>
          <li>Cumprimento de obrigações legais</li>
          <li>Determinação judicial</li>
          <li>Segurança da plataforma</li>
        </ul>

        <h2>5. Direitos do titular dos dados</h2>
        <p>Nos termos da LGPD, o usuário poderá solicitar:</p>
        <ul>
          <li>Confirmação de tratamento de dados</li>
          <li>Acesso aos dados pessoais</li>
          <li>Correção de dados incorretos</li>
          <li>Exclusão de dados</li>
          <li>Revogação de consentimento</li>
          <li>Informações sobre compartilhamento</li>
        </ul>
        <p>Solicitações poderão ser realizadas através do e-mail: <a href="mailto:gerencia@adeconex.com.br">gerencia@adeconex.com.br</a></p>

        <h2>6. Cookies e tecnologias similares</h2>
        <p>O portal utiliza cookies e tecnologias semelhantes para funcionamento técnico, estatísticas, segurança, personalização e publicidade. Mais informações em nossa <a href="/politica-de-cookies">Política de Cookies</a>.</p>

        <h2>7. Segurança das informações</h2>
        <p>A Adeconex adota medidas razoáveis de proteção contra acesso não autorizado, alteração indevida, vazamento de informações e perda de dados. Apesar disso, nenhum ambiente digital é totalmente livre de riscos.</p>

        <h2>8. Contato</h2>
        <ul>
          <li>E-mail: <a href="mailto:gerencia@adeconex.com.br">gerencia@adeconex.com.br</a></li>
          <li>Portal: <a href="https://www.adeconex.com">Adeconex Drivers</a></li>
        </ul>
      </LegalLayout>
    </>
  );
}
