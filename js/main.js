import ui from "./ui.js"
import api from "./api.js"

const pensamentosSet = new Set()

async function adicionarChaveAoPensamento() {
  try {
    const pensamentos = await api.buscarPensamentos()
    pensamentos.forEach(pensamento => {
      const chavePensamento = 
      `${pensamento.conteudo.trim().toLowerCase()}-${pensamento.autoria.trim().toLowerCase()}`
      pensamentosSet.add(chavePensamento)
    });
  } catch (error) {
    alert("Erro ao adicionar chave ao pensamento")
  }
}

function removerEspacos(string) {
  return string.replaceAll(/\s+/g, '')
}

const regexConteudo = /^[A-Za-zÀ-ÿ\d\s!?\.:,;"']{10,}$/

function validarConteudo(conteudo) {
  return regexConteudo.test(conteudo)
}

const regexAutoria = /^[A-Za-zÀ-ÿ\s]{3,15}$/

function validarAutoria(autoria) {
  return regexAutoria.test(autoria)
}

document.addEventListener("DOMContentLoaded", () => {
  ui.renderizarPensamentos()
  adicionarChaveAoPensamento()

  const formularioPensamento = document.getElementById("pensamento-form")
  const botaoCancelar = document.getElementById("botao-cancelar")
  const inputBusca = document.getElementById("campo-busca")

  formularioPensamento.addEventListener("submit", manipularSubmissaoFormulario)
  botaoCancelar.addEventListener("click", manipularCancelamento)
  inputBusca.addEventListener("input", manipularBusca)
})

async function manipularSubmissaoFormulario(event) {
  event.preventDefault();
  const id = document.getElementById("pensamento-id").value
  const conteudo = document.getElementById("pensamento-conteudo").value
  const autoria = document.getElementById("pensamento-autoria").value
  const data = document.getElementById("pensamento-data").value

  const conteudoSemEspaços = removerEspacos(conteudo)
  const autoriaSemEspaços = removerEspacos(autoria)

  if (!validarConteudo(conteudoSemEspaços)) {
    if (conteudo === "") {
      alert("Não é possível enviar um pensamento vazio.")
    } else if (conteudo.replace(/\s/g, "").length < 10) {
      alert(
        "O pensamento deve ter pelo menos 10 caracteres (descontando os espaços)."
      )
    } else {
      alert("O pensamento só pode conter letras, espaços e os símbolos a seguir: '!', ',', ';', ':', '.' e '?'")
    }
    return
  }

  if (!validarAutoria(autoriaSemEspaços)) {
    if (autoria === "") {
      alert("Por favor, informe o nome do autor.")
    } else {
      alert("O nome do autor deve conter pelo menos 3 letras, no máximo 15, e não pode conter símbolos, números ou pontuações.")
    }
    return
  }

  if(!validarData(data)) {
    alert("Não é permitido o cadastro de datas futuras. Selecione outra data.")
    return
  }

  const chaveNovoPensamento = 
  `${conteudo.trim().toLowerCase()}-${autoria.trim().toLowerCase()}`

  if(pensamentosSet.has(chaveNovoPensamento)) {
    alert("Este pensamento já existe")
    return
  }

  try {
    if(id) {
      await api.editarPensamento({ id, conteudo, autoria , data })
    } else {
      await api.salvarPensamento({ conteudo, autoria, data })
    }
    ui.renderizarPensamentos()
  }
  catch {
    alert("Erro ao salvar pensamento")
  }
}

function manipularCancelamento() {
  ui.limparFormulario()
}

async function manipularBusca() {
  const termoBusca = document.getElementById("campo-busca").value
  try {
    const pensamentosFiltrados = await api.buscarPensamentosPorTermo(termoBusca)
    ui.renderizarPensamentos(pensamentosFiltrados)
  } catch (error) {
    alert("Erro ao realziar busca")
    throw error
  }
}

function validarData(data) {
  const dataAtual = new Date()
  const dataInserida = new Date(data)
  return dataInserida <= dataAtual
}