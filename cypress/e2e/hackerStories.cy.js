/// <reference types="cypress"/>

describe("Hacker Stories", () => {
  const initialTerm = "React";
  const newTerm = "Cypress";

  context("Batendo API real", () => {
    beforeEach(() => {
      cy.intercept("GET", `**/search?query=${initialTerm}&page=0`).as(
        "getStories"
      );
      cy.visit("/");
      cy.wait("@getStories");

      cy.get(".item").first().should("contain", initialTerm);
    });

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept("GET", `**/search?query=${initialTerm}&page=0`).as(
        "getStories"
      );
      cy.visit("/");

      //cy.assertLoadingIsShownAndHidden()
      //cy.contains('More').should('be.visible')

      cy.get(".item").should("have.length", 20);

      cy.contains("More").click();

      cy.assertLoadingIsShownAndHidden();
      cy.wait("@getStories");
      cy.get(".item").should("have.length", 40);
    });

    it("searches via the last searched term", () => {
      cy.intercept("GET", `**/search?query=${newTerm}&page=0`).as(
        "getNewTermsStories"
      );
      cy.get("#search").clear();
      cy.get("#search").type(`${newTerm}{enter}`);
      cy.wait("@getNewTermsStories");

      cy.getLocalStorage("search").should("contain", newTerm);

      cy.get(`button:contains(${initialTerm})`).should("be.visible").click();
      cy.wait("@getStories");
      cy.get(".item").should("have.length", 20);
      cy.get(".item").first().should("contain", initialTerm);
      cy.get(`button:contains(${newTerm})`).should("be.visible");
    });

    //FIM CONTEXTO batendo api REAL
  });
  context("MOCK API", () => {
    context("Footer e listas", () => {
      const stories = require("../fixtures/stories");
      beforeEach(() => {
        cy.intercept("GET", `**/search?query=${initialTerm}&page=0`, {
          fixture: "stories",
        }).as("getStoriesJSON");
        cy.visit("/");
        cy.wait("@getStoriesJSON");
      });

      it("shows the footer", () => {
        //cy.wait("@getStoriesJSON")
        cy.get("footer")
          .should("be.visible")
          .and("contain", "Icons made by Freepik from www.flaticon.com");
      });

      context("List of stories", () => {
        it("shows the right data for all rendered stories", () => {
          cy.get(".item")
            .first()
            .should("be.visible")
            .and("contain", stories.hits[0].title)
            .and("contain", stories.hits[0].author)
            .and("contain", stories.hits[0].num_comments)
            .and("contain", stories.hits[0].points);
          cy.get(`.item a:contains(${stories.hits[0].title})`).should(
            "have.attr",
            "href",
            stories.hits[0].url
          );

          cy.get(".item")
            .last()
            .should("be.visible")
            .and("contain", stories.hits[1].title)
            .and("contain", stories.hits[1].author)
            .and("contain", stories.hits[1].num_comments)
            .and("contain", stories.hits[1].points);
          cy.get(`.item a:contains(${stories.hits[1].title})`).should(
            "have.attr",
            "href",
            stories.hits[1].url
          );
        });
      });

      context("Order by", () => {
        it("orders by title", () => {
          cy.get(".list-header-button:contains(Title)")
            .should("be.visible")
            .click();

          cy.get(".item a").first().should("contain", stories.hits[0].title);
          cy.get(".item a").last().should("contain", stories.hits[1].title);
        });

        it("orders by author", () => {
          cy.get(".list-header-button:contains(Author)")
            .should("be.visible")
            .click();
          cy.get(".item")
            .first()
            .should("be.visible")
            .and("contain", stories.hits[0].author);
        });

        it("orders by comments", () => {
          cy.get(".list-header-button:contains(Comments)")
            .should("be.visible")
            .click();
          cy.get(".item")
            .first()
            .should("be.visible")
            .and("contain", stories.hits[1].num_comments);
        });

        it("orders by points", () => {
          cy.get(".list-header-button:contains(Points)")
            .should("be.visible")
            .click();
          cy.get(".item")
            .first()
            .should("be.visible")
            .and("contain", stories.hits[1].points);
        });
      });
    });

    context("Search", () => {
      beforeEach(() => {
        cy.intercept("GET", `**/search?query=${initialTerm}&page=0`, {
          fixture: "empty",
        }).as("emptyJSON");
        cy.intercept("GET", `**/search?query=${newTerm}&page=0`, {
          fixture: "stories",
        }).as("storiesJSON");

        cy.visit("/");
        cy.wait("@emptyJSON");

        cy.get("#search").clear();
      });

      it("types and hits ENTER", () => {
        cy.get("#search").should("be.visible").type(`${newTerm}{enter}`);

        cy.wait("@storiesJSON");

        cy.get(".item").should("have.length", 2);
        cy.get(".item").first().should("contain", newTerm);
      });

      it("types and clicks the submit button", () => {
        cy.get("#search").type(newTerm);
        cy.contains("Submit").click();

        cy.wait("@storiesJSON");

        cy.get(".item").should("have.length", 2);
        cy.get(".item").first().should("contain", newTerm);
        cy.get(`button:contains(${initialTerm})`).should("be.visible");
      });
    });

    context("Last searches", () => {
      it("shows a max of 5 buttons for the last searched terms", () => {
        cy.visit("/");
        const faker = require("faker");

        cy.intercept("GET", "**/search**", { fixture: "empty" }).as(
          "getRandomStories"
        );

        Cypress._.times(6, () => {
          cy.get("#search").clear().type(`${faker.random.word()}{enter}`);
          cy.wait("@getRandomStories");
        });

        cy.get(".last-searches").within(() => {
          cy.get("button").should("have.length", 5);
        });
      });
    });
  });

  //teste de erro sempre fora do escopo de teste normal
});

it("Simulando DElay", () => {
  cy.intercept("GET", "**/search**", {
    delay: 2500,
    fixture: "stories",
  }).as("delayPett");

  cy.visit("/");
  cy.assertLoadingIsShownAndHidden();
  cy.wait("@delayPett");
});

context("Errors", () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept("GET", "**/search**", { statusCode: 500 }).as(
      "getServerFailure"
    );

    cy.visit("/");
    cy.wait("@getServerFailure");
    cy.get("p:contains(Something went wrong)").should("be.visible");
  });

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept("GET", "**/search**", { statusCode: 500 }).as(
      "getServerFailure"
    );

    cy.visit("/");
    cy.wait("@getServerFailure");
    cy.get("p:contains(Something went wrong)").should("be.visible");
  });
});

describe("LocalStorage", () => {
  //cy.getLocalStorage("search").should("contain", newTerm);
});
