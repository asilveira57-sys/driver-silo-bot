import { SEOHead } from "@/components/SEOHead";
import { LegalLayout } from "@/components/legal/LegalLayout";

export default function CookiesPage() {
  return (
    <>
      <SEOHead
        title="Política de Cookies"
        description="Entenda como a Adeconex utiliza cookies e tecnologias semelhantes durante a navegação no portal Adeconex Drivers."
        canonical="https://www.adeconex.com/politica-de-cookies"
      />
      <LegalLayout
        title="Política de Cookies"
        intro={<p>Esta Política de Cookies explica como a <strong>Adeconex</strong> utiliza cookies e tecnologias semelhantes durante a navegação dos usuários.</p>}
      >
        <h2>1. O que são cookies</h2>
        <p>Cookies são pequenos arquivos armazenados no navegador do usuário quando um site é acessado. Esses arquivos ajudam no funcionamento correto do portal, melhoram a experiência de navegação e permitem análises estatísticas e publicitárias.</p>

        <h2>2. Como utilizamos cookies</h2>
        <h3>Cookies essenciais</h3>
        <p>Necessários para funcionamento correto do site, segurança, autenticação e estabilidade da navegação.</p>
        <h3>Cookies de desempenho</h3>
        <p>Utilizados para análise estatística de acessos, páginas mais visitadas e comportamento de navegação.</p>
        <h3>Cookies de funcionalidade</h3>
        <p>Permitem lembrar preferências do usuário, idioma e configurações de navegação.</p>
        <h3>Cookies de publicidade</h3>
        <p>Utilizados por parceiros como Google AdSense para exibição de anúncios personalizados.</p>

        <h2>3. Cookies de terceiros</h2>
        <ul>
          <li>Google Analytics</li>
          <li>Google AdSense</li>
          <li>Google Ads</li>
          <li>YouTube</li>
          <li>Ferramentas de monitoramento e estatística</li>
        </ul>
        <p>Mais informações: <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener">Política de Cookies do Google</a>.</p>

        <h2>4. Gerenciamento de cookies</h2>
        <p>O usuário poderá bloquear, remover ou desativar cookies diretamente no navegador utilizado. Os principais navegadores disponibilizam configurações específicas para gerenciamento de cookies. A desativação poderá impactar algumas funcionalidades do portal.</p>

        <h2>5. Consentimento</h2>
        <p>Ao continuar navegando neste portal, o usuário concorda com a utilização de cookies conforme descrito nesta política.</p>

        <h2>6. Alterações desta política</h2>
        <p>Esta Política de Cookies poderá ser atualizada periodicamente para adequação legal ou técnica.</p>

        <h2>7. Contato</h2>
        <ul>
          <li>E-mail: <a href="mailto:vendas@adeconex.com.br">vendas@adeconex.com.br</a></li>
          <li>Portal: <a href="https://www.adeconex.com">Adeconex Drivers</a></li>
        </ul>
      </LegalLayout>
    </>
  );
}
