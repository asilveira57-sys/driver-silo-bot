import { SEOHead } from "@/components/SEOHead";
import { LegalLayout } from "@/components/legal/LegalLayout";

export default function PrivacidadePage() {
  return (
    <>
      <SEOHead
        title="Política de Privacidade"
        description="Saiba como a Adeconex coleta, utiliza e protege as informações dos usuários do portal Adeconex Drivers."
        canonical="https://www.adeconex.com/politica-de-privacidade"
      />
      <LegalLayout
        title="Política de Privacidade"
        intro={
          <>
            <p>A presente Política de Privacidade descreve como a <strong>Adeconex</strong> realiza a coleta, utilização, armazenamento e proteção das informações dos usuários que acessam este portal.</p>
            <p>Ao utilizar este site, você concorda com os termos desta Política de Privacidade.</p>
          </>
        }
      >
        <h2>1. Quem somos</h2>
        <p>O portal Adeconex Drivers é mantido pela Adeconex, empresa atuante no segmento de impressão térmica, automação comercial e soluções para identificação.</p>
        <ul>
          <li>Site institucional: <a href="https://www.adeconex.com.br" target="_blank" rel="noopener">www.adeconex.com.br</a></li>
          <li>Portal: <a href="https://www.adeconex.com">www.adeconex.com</a></li>
          <li>Contato: <a href="mailto:vendas@adeconex.com.br">vendas@adeconex.com.br</a></li>
        </ul>

        <h2>2. Informações coletadas</h2>
        <p>Durante a navegação, algumas informações poderão ser coletadas automaticamente, incluindo:</p>
        <ul>
          <li>Endereço IP</li><li>Tipo de navegador</li><li>Sistema operacional</li><li>Tempo de navegação</li>
          <li>Páginas acessadas</li><li>Dispositivo utilizado</li><li>Dados estatísticos de acesso</li><li>Cookies e identificadores de sessão</li>
        </ul>
        <p>Também poderemos coletar informações fornecidas voluntariamente pelo usuário através de formulários de contato, cadastro, suporte ou comentários.</p>

        <h2>3. Finalidade da coleta</h2>
        <ul>
          <li>Melhorar a experiência de navegação</li>
          <li>Garantir segurança e estabilidade do portal</li>
          <li>Gerar estatísticas e análises internas</li>
          <li>Personalizar conteúdo</li>
          <li>Exibir publicidade relevante</li>
          <li>Responder solicitações de suporte</li>
          <li>Cumprir obrigações legais</li>
          <li>Detectar atividades maliciosas ou abusivas</li>
        </ul>

        <h2>4. Uso de cookies e tecnologias similares</h2>
        <p>Este site utiliza cookies e tecnologias semelhantes para melhorar a experiência do usuário e oferecer funcionalidades adequadas.</p>
        <ul>
          <li>Funcionamento do portal</li><li>Estatísticas de acesso</li><li>Preferências do usuário</li>
          <li>Segurança</li><li>Publicidade personalizada</li><li>Integração com serviços do Google</li>
        </ul>
        <p>O usuário poderá desativar os cookies diretamente nas configurações do navegador.</p>

        <h2>5. Google AdSense e publicidade</h2>
        <p>O portal poderá utilizar serviços de publicidade do Google, incluindo o Google AdSense. O Google poderá utilizar cookies para exibir anúncios personalizados com base nas visitas do usuário a este e outros sites na internet.</p>
        <p>Mais informações: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener">Políticas de Publicidade do Google</a>.</p>
        <p>O usuário poderá gerenciar preferências de anúncios em: <a href="https://adssettings.google.com" target="_blank" rel="noopener">Configurações de anúncios do Google</a>.</p>

        <h2>6. Google Analytics</h2>
        <p>Este portal poderá utilizar o Google Analytics para análise estatística de navegação. As informações são coletadas de forma anonimizada para auxiliar na compreensão do comportamento dos visitantes e melhoria do conteúdo.</p>
        <p>Mais informações: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Analytics Privacy</a>.</p>

        <h2>7. Compartilhamento de informações</h2>
        <p>A Adeconex não comercializa dados pessoais dos usuários. As informações poderão ser compartilhadas apenas:</p>
        <ul>
          <li>Quando exigido por lei</li>
          <li>Para cumprimento de obrigações legais</li>
          <li>Com fornecedores tecnológicos essenciais para funcionamento do portal</li>
          <li>Para proteção de direitos da empresa</li>
          <li>Em casos de investigação de fraude ou abuso</li>
        </ul>

        <h2>8. Segurança das informações</h2>
        <p>Adotamos medidas técnicas e administrativas adequadas para proteger os dados contra acessos não autorizados, perda, alteração ou divulgação indevida. Apesar dos esforços de segurança, nenhum ambiente online é totalmente livre de riscos.</p>

        <h2>9. Links externos</h2>
        <p>O portal poderá conter links para sites externos, fabricantes, plataformas de download e terceiros. A Adeconex não se responsabiliza pelas políticas, conteúdos ou práticas desses sites externos.</p>

        <h2>10. Direitos do usuário</h2>
        <p>Nos termos da Lei Geral de Proteção de Dados (LGPD), o usuário poderá solicitar:</p>
        <ul>
          <li>Confirmação da existência de tratamento</li>
          <li>Acesso aos dados</li>
          <li>Correção de dados</li>
          <li>Exclusão de dados</li>
          <li>Revogação de consentimento</li>
          <li>Informações sobre compartilhamento</li>
        </ul>
        <p>Solicitações podem ser feitas pelo e-mail: <a href="mailto:gerencia@adeconex.com.br">gerencia@adeconex.com.br</a>.</p>

        <h2>11. Alterações desta política</h2>
        <p>Esta Política de Privacidade poderá ser alterada periodicamente para atualização legal, técnica ou operacional. Recomendamos consulta regular desta página.</p>

        <h2>12. Contato</h2>
        <p>Em caso de dúvidas sobre esta Política de Privacidade:</p>
        <ul>
          <li>E-mail: <a href="mailto:gerencia@adeconex.com.br">gerencia@adeconex.com.br</a></li>
          <li>Site: <a href="https://www.adeconex.com">Adeconex Drivers</a></li>
        </ul>
      </LegalLayout>
    </>
  );
}
