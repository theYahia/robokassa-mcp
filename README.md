# @theyahia/robokassa-mcp

MCP-сервер для Robokassa API — генерация платёжных ссылок, проверка статуса счетов. **2 инструмента.** Первый MCP-сервер для Robokassa.

[![npm](https://img.shields.io/npm/v/@theyahia/robokassa-mcp)](https://www.npmjs.com/package/@theyahia/robokassa-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "robokassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/robokassa-mcp"],
      "env": {
        "ROBOKASSA_LOGIN": "ваш-логин",
        "ROBOKASSA_PASSWORD1": "ваш-пароль-1",
        "ROBOKASSA_PASSWORD2": "ваш-пароль-2",
        "ROBOKASSA_TEST": "true"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add robokassa -e ROBOKASSA_LOGIN=ваш-логин -e ROBOKASSA_PASSWORD1=пароль1 -e ROBOKASSA_PASSWORD2=пароль2 -e ROBOKASSA_TEST=true -- npx -y @theyahia/robokassa-mcp
```

### VS Code / Cursor

```json
{
  "servers": {
    "robokassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/robokassa-mcp"],
      "env": {
        "ROBOKASSA_LOGIN": "ваш-логин",
        "ROBOKASSA_PASSWORD1": "ваш-пароль-1",
        "ROBOKASSA_PASSWORD2": "ваш-пароль-2",
        "ROBOKASSA_TEST": "true"
      }
    }
  }
}
```

### Windsurf

```json
{
  "mcpServers": {
    "robokassa": {
      "command": "npx",
      "args": ["-y", "@theyahia/robokassa-mcp"],
      "env": {
        "ROBOKASSA_LOGIN": "ваш-логин",
        "ROBOKASSA_PASSWORD1": "ваш-пароль-1",
        "ROBOKASSA_PASSWORD2": "ваш-пароль-2",
        "ROBOKASSA_TEST": "true"
      }
    }
  }
}
```

## Переменные окружения

| Переменная | Обязательна | Описание |
|------------|:-----------:|----------|
| `ROBOKASSA_LOGIN` | Да | Идентификатор магазина (MerchantLogin) |
| `ROBOKASSA_PASSWORD1` | Да | Пароль #1 — для формирования счетов |
| `ROBOKASSA_PASSWORD2` | Да | Пароль #2 — для проверки статуса |
| `ROBOKASSA_TEST` | Нет | `true` для тестового режима |

Настройки находятся в [личном кабинете Robokassa](https://partner.robokassa.ru/) → Технические настройки.

## Как работает Robokassa

Robokassa не использует REST API для создания платежей. Вместо этого формируется URL с MD5-подписью, по которому покупатель переходит для оплаты:

```
https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=X&OutSum=Y&InvId=Z&SignatureValue=MD5(login:sum:invid:password1)
```

Для проверки статуса используется XML-интерфейс OpStateExt.

## Инструменты (2)

| Инструмент | Описание |
|------------|----------|
| `create_invoice` | Создать счёт — сумма, описание, email, позиции чека 54-ФЗ. Возвращает ссылку на оплату |
| `check_invoice` | Проверить статус счёта по номеру через OpStateExt |

## Примеры запросов

```
Создай счёт на 3500 рублей за "Подписка на месяц", номер заказа 42
```

```
Создай счёт на 1200 рублей с чеком: товар "Консультация" 1200₽ НДС 20%, email buyer@example.com
```

```
Проверь статус счёта номер 42
```

## Часть серии Russian API MCP

| MCP | Статус | Описание |
|-----|--------|----------|
| [@metarebalance/dadata-mcp](https://github.com/theYahia/dadata-mcp) | готов | Адреса, компании, банки, телефоны |
| [@theyahia/cbr-mcp](https://github.com/theYahia/cbr-mcp) | готов | Курсы валют, ключевая ставка |
| [@theyahia/yookassa-mcp](https://github.com/theYahia/yookassa-mcp) | готов | Платежи, возвраты, чеки 54-ФЗ |
| [@theyahia/robokassa-mcp](https://github.com/theYahia/robokassa-mcp) | готов | Счета, статус платежей |
| @theyahia/moysklad-mcp | скоро | Склад, заказы, контрагенты |
| ... | | **+45 серверов** — [полный список](https://github.com/theYahia/russian-mcp) |

## Лицензия

MIT
