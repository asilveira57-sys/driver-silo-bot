import { SEOHead } from "@/components/SEOHead";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { Link } from "react-router-dom";

export default function TermosPage() {
  return (
    <>
      <SEOHead
        title="Termos e Condições de Uso"
        description="Termos e condições de uso do portal Adeconex Drivers: regras, responsabilidades e limitações para utilização do conteúdo."
        canonical="https://www.adeconex.com/termos-e-condicoes"
      />
      <LegalLayout
        title="Termos e Condições de Uso"
        intro={<p>Ao acessar ou utilizar o portal <strong>Adeconex Drivers</strong>, o usuário concorda integralmente com os presentes Termos e Condições de Uso.</p>}
      >
        <h2>1. Objetivo do portal</h2>
        <p>O portal disponibiliza conteúdos técnicos, drivers, softwares, arquivos, materiais informativos e conteúdos relacionados à impressão térmica, automação comercial e identificação.</p>

        <h2>2. Uso das informações</h2>
        <p>Os materiais disponibilizados possuem finalidade informativa e de apoio técnico. O usuário é responsável pela correta utilização dos arquivos, instalações e configurações realizadas em seus equipamentos.</p>

        <h2>3. Responsabilidade sobre downloads</h2>
        <p>Embora a Adeconex adote cuidados na disponibilização dos arquivos, não garante ausência absoluta de incompatibilidades, falhas ou erros específicos relacionados ao ambiente do usuário. O uso dos arquivos ocorre por conta e risco do usuário.</p>
        <p>Recomenda-se sempre:</p>
        <ul>
          <li>Verificar compatibilidade</li>
          <li>Manter backups</li>
          <li>Utilizar antivírus atualizado</li>
          <li>Seguir orientações dos fabricantes</li>
        </ul>

        <h2>4. Propriedade intelectual</h2>
        <p>Marcas, nomes comerciais, logotipos e softwares mencionados pertencem aos respectivos fabricantes e proprietários. A disponibilização de arquivos não implica cessão de direitos autorais, licença comercial ou vínculo oficial com fabricantes terceiros.</p>

        <h2>5. Limitação de responsabilidade</h2>
        <p>A Adeconex não será responsável por:</p>
        <ul>
          <li>Perda de dados</li>
          <li>Danos indiretos</li>
          <li>Interrupções operacionais</li>
          <li>Incompatibilidades técnicas</li>
          <li>Problemas decorrentes de instalações incorretas</li>
          <li>Danos causados por terceiros</li>
          <li>Uso inadequado dos arquivos disponibilizados</li>
        </ul>

        <h2>6. Conteúdo externo</h2>
        <p>O portal poderá conter links para sites externos e plataformas de terceiros. A Adeconex não possui controle sobre conteúdos, políticas ou práticas desses ambientes externos.</p>

        <h2>7. Conduta do usuário</h2>
        <p>É proibido utilizar o portal para:</p>
        <ul>
          <li>Práticas ilegais</li>
          <li>Tentativas de invasão</li>
          <li>Distribuição de malware</li>
          <li>Violação de direitos autorais</li>
          <li>Coleta indevida de informações</li>
          <li>Atividades abusivas ou fraudulentas</li>
        </ul>

        <h2>8. Disponibilidade do portal</h2>
        <p>A Adeconex poderá modificar, suspender ou remover conteúdos, funcionalidades e arquivos sem aviso prévio. Não há garantia de disponibilidade contínua e ininterrupta do portal.</p>

        <h2>9. Privacidade e cookies</h2>
        <p>O uso do portal também está sujeito às políticas:</p>
        <ul>
          <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
          <li><Link to="/politica-de-cookies">Política de Cookies</Link></li>
        </ul>

        <h2>10. Legislação aplicável</h2>
        <p>Os presentes Termos são regidos pelas leis da República Federativa do Brasil.</p>

        <h2>11. Alterações dos termos</h2>
        <p>A Adeconex poderá atualizar estes Termos e Condições a qualquer momento, sem aviso prévio.</p>

        <h2>12. Contato</h2>
        <ul>
          <li>E-mail: <a href="mailto:vendas@adeconex.com.br">vendas@adeconex.com.br</a></li>
          <li>Portal: <a href="https://www.adeconex.com">Adeconex Drivers</a></li>
        </ul>
      </LegalLayout>
    </>
  );
}
