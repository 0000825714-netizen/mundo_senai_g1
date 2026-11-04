
const formulario = document.getElementById("formulario");
const lista = document.getElementById("lista");
const total = document.getElementById("total");
const CHAVE = "cadastrosAlunosSENAI";

function carregar() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
        if (!Array.isArray(dados)) return [];
        return dados;
    } catch {
        alert("Não foi possível ler os dados armazenados.");
        return [];
    }
}

let alunos = carregar();

function salvar() {
    try {
        localStorage.setItem(CHAVE, JSON.stringify(alunos));
        return true;
    } catch {
        alert("Falha ao salvar. Verifique o armazenamento do navegador.");
        return false;
    }
}

function textoValido(valor, minimo = 2) {
    valor = valor.trim().replace(/\s+/g, " ");

    return valor.length >= minimo &&
        /[A-Za-zÀ-ÿ]/.test(valor) &&
        !/^(.)\1+$/.test(valor.replace(/\s/g, "")) &&
        !/(.)\1{5,}/i.test(valor);
}

function cpfValido(cpf) {
    cpf = cpf.replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    if (resto !== Number(cpf[9])) return false;

    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf[i]) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;

    return resto === Number(cpf[10]);
}

function telefoneValido(valor) {
    const n = valor.replace(/\D/g, "");

    if (n.length !== 10 && n.length !== 11) return false;
    if (/^(\d)\1+$/.test(n)) return false;

    const ddd = Number(n.slice(0, 2));

    if (ddd < 11 || ddd > 99) return false;
    if (n[2] === "0") return false;
    if (n.length === 11 && n[2] !== "9") return false;

    return true;
}

function emailValido(email) {
    if (email.length > 120 || /\s/.test(email)) return false;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
        !email.includes("..");
}

function nascimentoValido(valor) {
    if (!valor) return false;

    const data = new Date(valor + "T12:00:00");
    const hoje = new Date();

    if (Number.isNaN(data.getTime()) || data > hoje) return false;

    let idade = hoje.getFullYear() - data.getFullYear();

    if (
        hoje.getMonth() < data.getMonth() ||
        (hoje.getMonth() === data.getMonth() &&
         hoje.getDate() < data.getDate())
    ) {
        idade--;
    }

    return idade >= 14 && idade <= 100;
}

function validar(d) {
    if (!textoValido(d.nome, 5) ||
        d.nome.split(" ").filter(Boolean).length < 2) {
        return "Digite nome e sobrenome válidos.";
    }

    if (!cpfValido(d.cpf)) return "CPF inválido.";
    if (!emailValido(d.email)) return "E-mail inválido.";
    if (!telefoneValido(d.telefone)) return "Telefone inválido ou incompleto.";

    if (!nascimentoValido(d.nascimento)) {
        return "Data inválida. A idade permitida é de 14 a 100 anos.";
    }

    const cep = d.cep.replace(/\D/g, "");

    if (cep.length !== 8 || /^(\d)\1{7}$/.test(cep)) {
        return "CEP inválido. Digite os 8 números.";
    }

    if (!textoValido(d.logradouro, 3)) return "Logradouro inválido.";

    if (!/^(\d{1,10}[A-Za-z]?|S\/N)$/i.test(d.numero) ||
        /^0+$/.test(d.numero.replace(/[A-Za-z]/g, "")) &&
        !/^S\/N$/i.test(d.numero)) {
        return "Número de endereço inválido.";
    }

    if (!textoValido(d.bairro)) return "Bairro inválido.";
    if (!textoValido(d.cidade)) return "Cidade inválida.";

    const estados = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

    if (!estados.includes(d.uf)) return "Selecione um estado válido.";

    const cursos = [
        "Desenvolvimento de Sistemas", "Desenvolvimento Web",
        "Informática Básica", "Redes de Computadores",
        "Automação Industrial", "Eletrotécnica",
        "Mecânica Industrial", "Segurança do Trabalho",
        "Logística", "Design Gráfico"
    ];

    if (!cursos.includes(d.curso)) return "Selecione um curso válido.";
    if (!["Manhã", "Tarde", "Noite"].includes(d.turno)) return "Turno inválido.";
    if (!["Presencial", "EAD"].includes(d.modalidade)) return "Modalidade inválida.";

    return "";
}

formulario.addEventListener("submit", function(evento) {
    evento.preventDefault();

    const d = {
        nome: document.getElementById("nome").value.trim().replace(/\s+/g, " "),
        cpf: document.getElementById("cpf").value.replace(/\D/g, ""),
        email: document.getElementById("email").value.trim().toLowerCase(),
        telefone: document.getElementById("telefone").value.trim(),
        nascimento: document.getElementById("nascimento").value,
        cep: document.getElementById("cep").value,
        logradouro: document.getElementById("logradouro").value.trim(),
        numero: document.getElementById("numero").value.trim(),
        bairro: document.getElementById("bairro").value.trim(),
        cidade: document.getElementById("cidade").value.trim(),
        uf: document.getElementById("uf").value,
        curso: document.getElementById("curso").value,
        turno: document.getElementById("turno").value,
        modalidade: document.getElementById("modalidade").value
    };

    const erro = validar(d);

    if (erro) {
        alert("Cadastro bloqueado!\n\n" + erro);
        return;
    }

    if (alunos.some(a => a.cpf === d.cpf)) {
        alert("Este CPF já está cadastrado.");
        return;
    }

    d.dataCadastro = new Date().toLocaleString("pt-BR");

    alunos.push(d);

    if (!salvar()) {
        alunos.pop();
        return;
    }

    atualizarLista();
    formulario.reset();
    alert("Aluno cadastrado com sucesso!");
});

function criarElemento(tag, texto, classe) {
    const el = document.createElement(tag);
    el.textContent = texto;
    if (classe) el.className = classe;
    return el;
}

function atualizarLista() {
    lista.replaceChildren();

    total.textContent = alunos.length;
    document.getElementById("etiqueta-total").textContent =
        alunos.length + (alunos.length === 1 ? " REGISTRO" : " REGISTROS");

    if (alunos.length === 0) {
        lista.appendChild(criarElemento(
            "p", "Nenhum cadastro realizado até o momento.", "vazio"
        ));
        return;
    }

    alunos.forEach((a, i) => {
        const card = document.createElement("article");
        card.className = "aluno";

        card.appendChild(criarElemento("h4", (i + 1) + ". " + a.nome));

        const campos = [
            ["CPF", a.cpf],
            ["E-mail", a.email],
            ["Telefone", a.telefone],
            ["Nascimento", a.nascimento],
            ["Endereço", a.logradouro + ", " + a.numero],
            ["Bairro", a.bairro],
            ["Cidade", a.cidade + " - " + a.uf],
            ["CEP", a.cep],
            ["Curso", a.curso],
            ["Turno", a.turno],
            ["Modalidade", a.modalidade],
            ["Data do cadastro", a.dataCadastro]
        ];

        campos.forEach(([nome, valor]) => {
            card.appendChild(criarElemento("p", nome + ": " + valor));
        });

        lista.appendChild(card);
    });
}

document.getElementById("limpar").addEventListener("click", () => {
    formulario.reset();
});

document.getElementById("baixar").addEventListener("click", () => {
    if (alunos.length === 0) {
        alert("Não existem cadastros para exportar.");
        return;
    }

    let relatorio = "RELATÓRIO DE CADASTROS - SENAI\n";
    relatorio += "Total de alunos: " + alunos.length + "\n\n";

    alunos.forEach((a, i) => {
        relatorio += "ALUNO " + (i + 1) + "\n";
        relatorio += "------------------------------\n";

        [
            ["Nome", a.nome], ["CPF", a.cpf],
            ["E-mail", a.email], ["Telefone", a.telefone],
            ["Nascimento", a.nascimento], ["CEP", a.cep],
            ["Logradouro", a.logradouro], ["Número", a.numero],
            ["Bairro", a.bairro], ["Cidade", a.cidade],
            ["Estado", a.uf], ["Curso", a.curso],
            ["Turno", a.turno], ["Modalidade", a.modalidade],
            ["Data do cadastro", a.dataCadastro]
        ].forEach(([campo, valor]) => {
            relatorio += campo + ": " + valor + "\n";
        });

        relatorio += "\n";
    });

    const arquivo = new Blob(["\uFEFF" + relatorio], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cadastros_alunos.txt";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// Máscara do CPF
document.getElementById("cpf").addEventListener("input", function() {
    let v = this.value.replace(/\D/g, "").slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    this.value = v;
});

// Máscara do telefone
document.getElementById("telefone").addEventListener("input", function() {
    let v = this.value.replace(/\D/g, "").slice(0, 11);

    if (v.length > 10) {
        v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    } else if (v.length > 6) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (v.length > 2) {
        v = v.replace(/(\d{2})(\d+)/, "($1) $2");
    }

    this.value = v;
});

// Máscara do CEP
document.getElementById("cep").addEventListener("input", function() {
    let v = this.value.replace(/\D/g, "").slice(0, 8);

    if (v.length > 5) {
        v = v.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }

    this.value = v;
});

// Impede datas futuras e define o limite de idade.
const hoje = new Date();
const limiteNascimento = new Date(
    hoje.getFullYear() - 14,
    hoje.getMonth(),
    hoje.getDate()
);

document.getElementById("nascimento").max =
    limiteNascimento.getFullYear() + "-" +
    String(limiteNascimento.getMonth() + 1).padStart(2, "0") + "-" +
    String(limiteNascimento.getDate()).padStart(2, "0");

atualizarLista();