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

      cy.get(`button:contains(${initialTerm})`).should("be.visible").click();
      cy.wait("@getStories");
      cy.get(".item").should("have.length", 20);
      cy.get(".item").first().should("contain", initialTerm);
      cy.get(`button:contains(${newTerm})`).should("be.visible");
    });

    

    //FIM CONTEXTO batendo api REAL
  });

  context("List of stories", () => {

    it("shows the footer", () => {
      cy.visit("/");
      cy.get("footer")
        .should("be.visible")
        .and("contain", "Icons made by Freepik from www.flaticon.com");
    });

    it.skip("shows the right data for all rendered stories", () => {});

    

    it.skip("shows only nineteen stories after dimissing the first story", () => {
      cy.get(".button-small").first().click();

      cy.get(".item").should("have.length", 19);
    });

  
    context.skip("Order by", () => {
      it("orders by title", () => {});

      it("orders by author", () => {});

      it("orders by comments", () => {});

      it("orders by points", () => {});
    });
  });

  context("Search", () => {
    const initialTerm = "React";
    const newTerm = "Cypress";


    it.skip("types and hits ENTER", () => {
      cy.get("#search").type(`${newTerm}{enter}`);

      cy.wait("@getNewTermsStories");

      cy.get(".item").should("have.length", 20);
      cy.get(".item").first().should("contain", newTerm);
      cy.get(`button:contains(${initialTerm})`).should("be.visible");
    });

    it.skip("types and clicks the submit button", () => {
      cy.get("#search").type(newTerm);
      cy.contains("Submit").click();

      cy.wait("@getNewTermsStories");

      cy.get(".item").should("have.length", 20);
      cy.get(".item").first().should("contain", newTerm);
      cy.get(`button:contains(${initialTerm})`).should("be.visible");
    });


    context("Last searches", () => {
      it.skip("shows a max of 5 buttons for the last searched terms", () => {
        const faker = require("faker");

        cy.intercept({
          method: "GET",
          pathname: "**/search**",
        }).as("getRandomStories");

        Cypress._.times(6, () => {
          cy.get("#search").clear().type(`${faker.random.word()}{enter}`);
          cy.wait("@getRandomStories");
        });

        cy.get(".last-searches button").should("have.length", 5);
      });
    });
  });
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
